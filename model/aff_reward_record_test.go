package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupAffiliateRewardTest(t *testing.T) {
	t.Helper()

	oldQuotaForInviter := common.QuotaForInviter
	oldQuotaPerUnit := common.QuotaPerUnit
	t.Cleanup(func() {
		common.QuotaForInviter = oldQuotaForInviter
		common.QuotaPerUnit = oldQuotaPerUnit
		DB.Exec("DELETE FROM aff_reward_records")
		DB.Exec("DELETE FROM logs")
		DB.Exec("DELETE FROM users")
	})

	common.QuotaForInviter = 10
	common.QuotaPerUnit = 1000

	if !DB.Migrator().HasTable(&AffRewardRecord{}) {
		require.NoError(t, DB.AutoMigrate(&AffRewardRecord{}))
	}
	DB.Exec("DELETE FROM aff_reward_records")
	DB.Exec("DELETE FROM logs")
	DB.Exec("DELETE FROM users")
}

func createAffiliateUser(t *testing.T, username string, inviterID int) *User {
	t.Helper()

	user := &User{
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
	require.NoError(t, DB.Create(user).Error)
	return user
}

func loadAffiliateUser(t *testing.T, userID int) *User {
	t.Helper()

	var user User
	require.NoError(t, DB.First(&user, userID).Error)
	return &user
}

func countAffiliateRewards(t *testing.T) int64 {
	t.Helper()

	var count int64
	require.NoError(t, DB.Model(&AffRewardRecord{}).Count(&count).Error)
	return count
}

func TestRecordTopupLogRewardsInviterOnRecharge(t *testing.T) {
	setupAffiliateRewardTest(t)

	inviter := createAffiliateUser(t, "inviter-topup", 0)
	invitee := createAffiliateUser(t, "invitee-topup", inviter.Id)

	RecordTopupLog(RecordTopupLogParams{
		UserId:      invitee.Id,
		Content:     "online topup success",
		Quota:       8000,
		AmountUSD:   8,
		ReferenceId: "topup-1",
	})

	var record AffRewardRecord
	require.NoError(t, DB.First(&record).Error)
	assert.Equal(t, inviter.Id, record.InviterId)
	assert.Equal(t, invitee.Id, record.InviteeId)
	assert.Equal(t, LogTypeTopup, record.SourceLogType)
	assert.Equal(t, 8000, record.ConsumedQuota)
	assert.Equal(t, 8.0, record.ConsumedAmountUSD)
	assert.Equal(t, 800, record.RewardQuota)

	reloadedInviter := loadAffiliateUser(t, inviter.Id)
	assert.Equal(t, 800, reloadedInviter.AffQuota)
	assert.Equal(t, 800, reloadedInviter.AffHistoryQuota)
}

func TestRecordTaskBillingLogConsumeDoesNotRewardInviter(t *testing.T) {
	setupAffiliateRewardTest(t)

	inviter := createAffiliateUser(t, "inviter-consume", 0)
	invitee := createAffiliateUser(t, "invitee-consume", inviter.Id)

	RecordTaskBillingLog(RecordTaskBillingLogParams{
		UserId:    invitee.Id,
		LogType:   LogTypeConsume,
		Content:   "usage consume",
		ModelName: "gpt-test",
		Quota:     5000,
	})

	assert.Equal(t, int64(0), countAffiliateRewards(t))
	reloadedInviter := loadAffiliateUser(t, inviter.Id)
	assert.Equal(t, 0, reloadedInviter.AffQuota)
	assert.Equal(t, 0, reloadedInviter.AffHistoryQuota)
}

func TestRewardAffiliateByTopupLogIsIdempotent(t *testing.T) {
	setupAffiliateRewardTest(t)

	inviter := createAffiliateUser(t, "inviter-idempotent", 0)
	invitee := createAffiliateUser(t, "invitee-idempotent", inviter.Id)

	logEntry := &Log{
		UserId:    invitee.Id,
		Username:  invitee.Username,
		CreatedAt: common.GetTimestamp(),
		Type:      LogTypeTopup,
		Content:   "manual reward test",
		Quota:     10000,
		RequestId: "dup-topup",
		Other:     common.MapToJsonStr(map[string]interface{}{"topup_amount_usd": 10.0}),
	}
	require.NoError(t, LOG_DB.Create(logEntry).Error)

	require.NoError(t, RewardAffiliateByTopupLog(logEntry))
	require.NoError(t, RewardAffiliateByTopupLog(logEntry))

	assert.Equal(t, int64(1), countAffiliateRewards(t))
	reloadedInviter := loadAffiliateUser(t, inviter.Id)
	assert.Equal(t, 1000, reloadedInviter.AffQuota)
	assert.Equal(t, 1000, reloadedInviter.AffHistoryQuota)
}

func TestRewardAffiliateByTopupLogSupportsAmountOnlyRecharge(t *testing.T) {
	setupAffiliateRewardTest(t)

	inviter := createAffiliateUser(t, "inviter-subscription", 0)
	invitee := createAffiliateUser(t, "invitee-subscription", inviter.Id)

	logEntry := &Log{
		UserId:    invitee.Id,
		Username:  invitee.Username,
		CreatedAt: common.GetTimestamp(),
		Type:      LogTypeTopup,
		Content:   "subscription purchase",
		RequestId: "subscription-1",
		Other:     common.MapToJsonStr(map[string]interface{}{"topup_amount_usd": 12.5}),
	}
	require.NoError(t, LOG_DB.Create(logEntry).Error)
	require.NoError(t, RewardAffiliateByTopupLog(logEntry))

	var record AffRewardRecord
	require.NoError(t, DB.First(&record).Error)
	assert.Equal(t, 12500, record.ConsumedQuota)
	assert.Equal(t, 12.5, record.ConsumedAmountUSD)
	assert.Equal(t, 1250, record.RewardQuota)

	reloadedInviter := loadAffiliateUser(t, inviter.Id)
	assert.Equal(t, 1250, reloadedInviter.AffQuota)
	assert.Equal(t, 1250, reloadedInviter.AffHistoryQuota)
}

func TestSubscriptionRewardMetricsUsesPlanTotalAmountSnapshot(t *testing.T) {
	setupAffiliateRewardTest(t)

	plan := &SubscriptionPlan{
		TotalAmount: int64(amountToQuota(255)),
	}
	quota, creditAmount, unitPrice := subscriptionRewardMetrics(plan, 51)
	assert.Equal(t, 255000, quota)
	assert.Equal(t, 255.0, creditAmount)
	assert.InDelta(t, 0.2, unitPrice, 0.000001)

	inviter := createAffiliateUser(t, "inviter-subscription-plan", 0)
	invitee := createAffiliateUser(t, "invitee-subscription-plan", inviter.Id)
	RecordTopupLog(RecordTopupLogParams{
		UserId:       invitee.Id,
		Content:      "subscription purchase",
		Quota:        quota,
		AmountUSD:    51,
		CreditAmount: creditAmount,
		UnitPrice:    unitPrice,
		ReferenceId:  "subscription-plan-1",
		Other: map[string]interface{}{
			"topup_scene": "subscription",
		},
	})

	records, total, err := GetPromotionRewardRecords("", &common.PageInfo{Page: 0, PageSize: 10})
	require.NoError(t, err)
	require.Equal(t, int64(1), total)
	require.Len(t, records, 1)
	assert.Equal(t, 51.0, records[0].PaidAmount)
	assert.Equal(t, 255.0, records[0].CreditAmountUSD)
	assert.Equal(t, 5.1, records[0].RewardAmount)
	assert.Equal(t, 25.5, records[0].RewardAmountUSD)

	reloadedInviter := loadAffiliateUser(t, inviter.Id)
	assert.Equal(t, 25500, reloadedInviter.AffQuota)
	assert.Equal(t, 25500, reloadedInviter.AffHistoryQuota)
}

func TestRewardAffiliateByTopupLogPrefersCreditAmountSnapshot(t *testing.T) {
	setupAffiliateRewardTest(t)

	inviter := createAffiliateUser(t, "inviter-credit-snapshot", 0)
	invitee := createAffiliateUser(t, "invitee-credit-snapshot", inviter.Id)

	logEntry := &Log{
		UserId:    invitee.Id,
		Username:  invitee.Username,
		CreatedAt: common.GetTimestamp(),
		Type:      LogTypeTopup,
		Content:   "epay topup with credit snapshot",
		Quota:     50000,
		RequestId: "credit-snapshot-1",
		Other: common.MapToJsonStr(map[string]interface{}{
			"topup_amount_usd":    8.0,
			"topup_credit_amount": 100.0,
			"topup_unit_price":    0.08,
		}),
	}
	require.NoError(t, LOG_DB.Create(logEntry).Error)
	require.NoError(t, RewardAffiliateByTopupLog(logEntry))

	var record AffRewardRecord
	require.NoError(t, DB.First(&record).Error)
	assert.Equal(t, 100000, record.ConsumedQuota)
	assert.Equal(t, 8.0, record.ConsumedAmountUSD)
	assert.Equal(t, 10000, record.RewardQuota)

	reloadedInviter := loadAffiliateUser(t, inviter.Id)
	assert.Equal(t, 10000, reloadedInviter.AffQuota)
	assert.Equal(t, 10000, reloadedInviter.AffHistoryQuota)
}

func TestRewardAffiliateByTopupLogClampsRewardRateToOneHundredPercent(t *testing.T) {
	setupAffiliateRewardTest(t)
	common.QuotaForInviter = 300

	inviter := createAffiliateUser(t, "inviter-clamp-rate", 0)
	invitee := createAffiliateUser(t, "invitee-clamp-rate", inviter.Id)

	RecordTopupLog(RecordTopupLogParams{
		UserId:       invitee.Id,
		Content:      "clamp reward rate",
		Quota:        8000,
		AmountUSD:    8,
		CreditAmount: 8,
		UnitPrice:    1,
		ReferenceId:  "clamp-rate-1",
	})

	var record AffRewardRecord
	require.NoError(t, DB.First(&record).Error)
	assert.Equal(t, 100, record.RewardRate)
	assert.Equal(t, 8000, record.RewardQuota)
}
