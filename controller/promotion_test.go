package controller

import (
	"net/http"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

type promotionOverviewResponse struct {
	RegisteredInviteeCount int     `json:"registered_invitee_count"`
	ConsumedInviteeCount   int     `json:"consumed_invitee_count"`
	TotalConsumedQuota     int     `json:"total_consumed_quota"`
	TotalConsumedAmountUSD float64 `json:"total_consumed_amount_usd"`
	TotalCommissionQuota   int     `json:"total_commission_quota"`
	CommissionRate         int     `json:"commission_rate"`
	InviteeBonusQuota      int     `json:"invitee_bonus_quota"`
}

type promotionInviteesResponse struct {
	Page     int                       `json:"page"`
	PageSize int                       `json:"page_size"`
	Total    int                       `json:"total"`
	Items    []*model.PromotionInvitee `json:"items"`
}

type promotionRewardRecordResponse struct {
	Page     int                            `json:"page"`
	PageSize int                            `json:"page_size"`
	Total    int                            `json:"total"`
	Items    []*model.PromotionRewardRecord `json:"items"`
}

func setupPromotionControllerTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	common.UsingSQLite = true
	common.UsingMySQL = false
	common.UsingPostgreSQL = false
	common.RedisEnabled = false
	common.QuotaForInviter = 10
	common.QuotaForInvitee = 2000

	dsn := "file:" + t.Name() + "?mode=memory&cache=shared"
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}

	model.DB = db
	model.LOG_DB = db

	if err = db.AutoMigrate(&model.User{}, &model.AffRewardRecord{}); err != nil {
		t.Fatalf("failed to migrate promotion tables: %v", err)
	}

	t.Cleanup(func() {
		sqlDB, err := db.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
	})

	return db
}

func seedPromotionUser(t *testing.T, db *gorm.DB, username string, inviterID int) *model.User {
	t.Helper()

	user := &model.User{
		Username:    username,
		Password:    "hashed-password",
		DisplayName: username + "-display",
		Email:       username + "@qq.com",
		Role:        common.RoleCommonUser,
		Status:      common.UserStatusEnabled,
		Group:       "default",
		AffCode:     username + "-aff",
		InviterId:   inviterID,
	}
	if err := db.Create(user).Error; err != nil {
		t.Fatalf("failed to create user %s: %v", username, err)
	}
	return user
}

func seedPromotionRewardRecord(t *testing.T, db *gorm.DB, inviterID int, inviteeID int, sourceLogID int, sourceLogType int, consumedQuota int, consumedAmountUSD float64, rewardQuota int, createdAt int64) {
	t.Helper()

	record := &model.AffRewardRecord{
		InviterId:         inviterID,
		InviteeId:         inviteeID,
		SourceLogId:       sourceLogID,
		SourceLogType:     sourceLogType,
		SourceRequestId:   "req-" + common.GetUUID(),
		ConsumedQuota:     consumedQuota,
		ConsumedAmountUSD: consumedAmountUSD,
		RewardRate:        common.QuotaForInviter,
		RewardQuota:       rewardQuota,
		CreatedAt:         createdAt,
	}
	if err := db.Create(record).Error; err != nil {
		t.Fatalf("failed to create reward record: %v", err)
	}
}

func TestGetPromotionOverviewReturnsAggregatedData(t *testing.T) {
	db := setupPromotionControllerTestDB(t)
	inviter := seedPromotionUser(t, db, "inviter", 0)
	inviteeOne := seedPromotionUser(t, db, "invitee-one", inviter.Id)
	inviteeTwo := seedPromotionUser(t, db, "invitee-two", inviter.Id)

	seedPromotionRewardRecord(t, db, inviter.Id, inviteeOne.Id, 1001, model.LogTypeTopup, 5000, 5.0, 500, 1710000000)
	seedPromotionRewardRecord(t, db, inviter.Id, inviteeOne.Id, 1002, model.LogTypeTopup, 3000, 3.0, 300, 1710000300)
	seedPromotionRewardRecord(t, db, inviter.Id, inviteeTwo.Id, 1003, model.LogTypeTopup, 2000, 2.0, 200, 1710000600)
	seedPromotionRewardRecord(t, db, inviter.Id, inviteeTwo.Id, 1999, model.LogTypeConsume, 9999, 9.999, 999, 1710000900)

	ctx, recorder := newAuthenticatedContext(t, http.MethodGet, "/api/user/promotion/overview", nil, inviter.Id)
	GetPromotionOverview(ctx)

	response := decodeAPIResponse(t, recorder)
	if !response.Success {
		t.Fatalf("expected success response, got message: %s", response.Message)
	}

	var overview promotionOverviewResponse
	if err := common.Unmarshal(response.Data, &overview); err != nil {
		t.Fatalf("failed to decode overview response: %v", err)
	}

	if overview.RegisteredInviteeCount != 2 {
		t.Fatalf("expected 2 registered invitees, got %d", overview.RegisteredInviteeCount)
	}
	if overview.ConsumedInviteeCount != 2 {
		t.Fatalf("expected 2 consumed invitees, got %d", overview.ConsumedInviteeCount)
	}
	if overview.TotalConsumedQuota != 10000 {
		t.Fatalf("expected total consumed quota 10000, got %d", overview.TotalConsumedQuota)
	}
	if overview.TotalCommissionQuota != 1000 {
		t.Fatalf("expected total commission quota 1000, got %d", overview.TotalCommissionQuota)
	}
	if overview.CommissionRate != 10 {
		t.Fatalf("expected commission rate 10, got %d", overview.CommissionRate)
	}
	if overview.InviteeBonusQuota != 2000 {
		t.Fatalf("expected invitee bonus quota 2000, got %d", overview.InviteeBonusQuota)
	}
}

func TestGetPromotionInviteesReturnsEmptyPage(t *testing.T) {
	db := setupPromotionControllerTestDB(t)
	inviter := seedPromotionUser(t, db, "empty-inviter", 0)

	ctx, recorder := newAuthenticatedContext(t, http.MethodGet, "/api/user/promotion/invitees?p=1&page_size=10", nil, inviter.Id)
	GetPromotionInvitees(ctx)

	response := decodeAPIResponse(t, recorder)
	if !response.Success {
		t.Fatalf("expected success response, got message: %s", response.Message)
	}

	var page promotionInviteesResponse
	if err := common.Unmarshal(response.Data, &page); err != nil {
		t.Fatalf("failed to decode invitees response: %v", err)
	}

	if page.Total != 0 {
		t.Fatalf("expected total 0, got %d", page.Total)
	}
	if len(page.Items) != 0 {
		t.Fatalf("expected empty invitees list, got %d items", len(page.Items))
	}
}

func TestGetPromotionInviteesAggregatesAndSortsConsumeData(t *testing.T) {
	db := setupPromotionControllerTestDB(t)
	inviter := seedPromotionUser(t, db, "ranked-inviter", 0)
	inviteeOne := seedPromotionUser(t, db, "alice", inviter.Id)
	inviteeTwo := seedPromotionUser(t, db, "bob", inviter.Id)

	seedPromotionRewardRecord(t, db, inviter.Id, inviteeOne.Id, 2001, model.LogTypeTopup, 1200, 1.2, 120, 1711000000)
	seedPromotionRewardRecord(t, db, inviter.Id, inviteeOne.Id, 2002, model.LogTypeTopup, 800, 0.8, 80, 1711000500)
	seedPromotionRewardRecord(t, db, inviter.Id, inviteeTwo.Id, 2003, model.LogTypeTopup, 500, 0.5, 50, 1711000200)
	seedPromotionRewardRecord(t, db, inviter.Id, inviteeTwo.Id, 2004, model.LogTypeConsume, 2000, 2.0, 200, 1711000800)

	ctx, recorder := newAuthenticatedContext(t, http.MethodGet, "/api/user/promotion/invitees?p=1&page_size=10", nil, inviter.Id)
	GetPromotionInvitees(ctx)

	response := decodeAPIResponse(t, recorder)
	if !response.Success {
		t.Fatalf("expected success response, got message: %s", response.Message)
	}

	var page promotionInviteesResponse
	if err := common.Unmarshal(response.Data, &page); err != nil {
		t.Fatalf("failed to decode invitees response: %v", err)
	}

	if page.Total != 2 {
		t.Fatalf("expected total 2, got %d", page.Total)
	}
	if len(page.Items) != 2 {
		t.Fatalf("expected 2 invitees, got %d", len(page.Items))
	}

	if page.Items[0].Username != "alice" {
		t.Fatalf("expected alice first by recent consumption, got %s", page.Items[0].Username)
	}
	if page.Items[0].RewardCount != 2 {
		t.Fatalf("expected alice reward count 2, got %d", page.Items[0].RewardCount)
	}
	if page.Items[0].TotalConsumedQuota != 2000 {
		t.Fatalf("expected alice total consumed quota 2000, got %d", page.Items[0].TotalConsumedQuota)
	}
	if page.Items[0].TotalRewardQuota != 200 {
		t.Fatalf("expected alice total reward quota 200, got %d", page.Items[0].TotalRewardQuota)
	}
	if page.Items[0].FirstConsumeTime != 1711000000 {
		t.Fatalf("expected alice first consume time 1711000000, got %d", page.Items[0].FirstConsumeTime)
	}
	if page.Items[0].LastConsumeTime != 1711000500 {
		t.Fatalf("expected alice last consume time 1711000500, got %d", page.Items[0].LastConsumeTime)
	}
}

func TestGetPromotionRewardRecordsReturnsHistoricalAmounts(t *testing.T) {
	db := setupPromotionControllerTestDB(t)
	inviter := seedPromotionUser(t, db, "rebate-inviter", 0)
	invitee := seedPromotionUser(t, db, "rebate-invitee", inviter.Id)

	seedPromotionRewardRecord(
		t,
		db,
		inviter.Id,
		invitee.Id,
		3001,
		model.LogTypeTopup,
		50000000, // 100 USD credit
		10.0,     // 10 RMB paid
		5000000,  // 10 USD reward
		1712000000,
	)

	ctx, recorder := newAuthenticatedContext(t, http.MethodGet, "/api/user/promotion/rewards?p=1&page_size=10", nil, inviter.Id)
	GetPromotionRewardRecords(ctx)

	response := decodeAPIResponse(t, recorder)
	if !response.Success {
		t.Fatalf("expected success response, got message: %s", response.Message)
	}

	var page promotionRewardRecordResponse
	if err := common.Unmarshal(response.Data, &page); err != nil {
		t.Fatalf("failed to decode reward records response: %v", err)
	}

	if page.Total != 1 {
		t.Fatalf("expected total 1, got %d", page.Total)
	}
	if len(page.Items) != 1 {
		t.Fatalf("expected 1 reward record, got %d", len(page.Items))
	}

	record := page.Items[0]
	if record.InviteeUsername != "rebate-invitee" {
		t.Fatalf("expected invitee username rebate-invitee, got %s", record.InviteeUsername)
	}
	if record.InviterUsername != "rebate-inviter" {
		t.Fatalf("expected inviter username rebate-inviter, got %s", record.InviterUsername)
	}
	if record.PaidAmount != 10.0 {
		t.Fatalf("expected paid amount 10.0, got %f", record.PaidAmount)
	}
	if record.CreditAmountUSD != 100.0 {
		t.Fatalf("expected credit amount usd 100.0, got %f", record.CreditAmountUSD)
	}
	if record.RewardAmount != 1.0 {
		t.Fatalf("expected reward amount 1.0, got %f", record.RewardAmount)
	}
	if record.RewardAmountUSD != 10.0 {
		t.Fatalf("expected reward amount usd 10.0, got %f", record.RewardAmountUSD)
	}
}
