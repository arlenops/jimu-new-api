package model

import (
	"fmt"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AffRewardRecord struct {
	Id                int     `json:"id"`
	InviterId         int     `json:"inviter_id" gorm:"type:int;not null;index"`
	InviteeId         int     `json:"invitee_id" gorm:"type:int;not null;index"`
	SourceLogId       int     `json:"source_log_id" gorm:"type:int;not null;uniqueIndex"`
	SourceLogType     int     `json:"source_log_type" gorm:"type:int;not null;default:2"`
	SourceRequestId   string  `json:"source_request_id" gorm:"type:varchar(64);default:'';index"`
	ConsumedQuota     int     `json:"consumed_quota" gorm:"type:int;not null;default:0"`
	ConsumedAmountUSD float64 `json:"consumed_amount_usd" gorm:"type:decimal(12,6);not null;default:0"`
	RewardRate        int     `json:"reward_rate" gorm:"type:int;not null;default:0"`
	RewardQuota       int     `json:"reward_quota" gorm:"type:int;not null;default:0"`
	CreatedAt         int64   `json:"created_at" gorm:"bigint;not null;index"`
}

type PromotionOverview struct {
	RegisteredInviteeCount int     `json:"registered_invitee_count"`
	ConsumedInviteeCount   int     `json:"consumed_invitee_count"`
	TotalConsumedQuota     int     `json:"total_consumed_quota"`
	TotalConsumedAmountUSD float64 `json:"total_consumed_amount_usd"`
	TotalCommissionQuota   int     `json:"total_commission_quota"`
	CommissionRate         int     `json:"commission_rate"`
	InviteeBonusQuota      int     `json:"invitee_bonus_quota"`
}

type PromotionInvitee struct {
	InviteeId              int     `json:"invitee_id"`
	Username               string  `json:"username"`
	DisplayName            string  `json:"display_name"`
	Email                  string  `json:"email"`
	Status                 int     `json:"status"`
	RewardCount            int64   `json:"reward_count"`
	TotalConsumedQuota     int     `json:"total_consumed_quota"`
	TotalConsumedAmountUSD float64 `json:"total_consumed_amount_usd"`
	TotalRewardQuota       int     `json:"total_reward_quota"`
	FirstConsumeTime       int64   `json:"first_consume_time"`
	LastConsumeTime        int64   `json:"last_consume_time"`
}

type PromotionRewardRecord struct {
	Id                 int     `json:"id"`
	SourceLogId        int     `json:"source_log_id"`
	SourceRequestId    string  `json:"source_request_id"`
	InviterId          int     `json:"inviter_id"`
	InviterUsername    string  `json:"inviter_username"`
	InviterDisplayName string  `json:"inviter_display_name"`
	InviterEmail       string  `json:"inviter_email"`
	InviteeId          int     `json:"invitee_id"`
	InviteeUsername    string  `json:"invitee_username"`
	InviteeDisplayName string  `json:"invitee_display_name"`
	InviteeEmail       string  `json:"invitee_email"`
	RewardRate         int     `json:"reward_rate"`
	PaidAmount         float64 `json:"paid_amount"`
	CreditAmountUSD    float64 `json:"credit_amount_usd"`
	RewardAmount       float64 `json:"reward_amount"`
	RewardAmountUSD    float64 `json:"reward_amount_usd"`
	ConsumedQuota      int     `json:"consumed_quota"`
	RewardQuota        int     `json:"reward_quota"`
	CreatedAt          int64   `json:"created_at"`
}

type promotionRewardRecordRow struct {
	Id                 int     `gorm:"column:id"`
	SourceLogId        int     `gorm:"column:source_log_id"`
	SourceRequestId    string  `gorm:"column:source_request_id"`
	InviterId          int     `gorm:"column:inviter_id"`
	InviterUsername    string  `gorm:"column:inviter_username"`
	InviterDisplayName string  `gorm:"column:inviter_display_name"`
	InviterEmail       string  `gorm:"column:inviter_email"`
	InviteeId          int     `gorm:"column:invitee_id"`
	InviteeUsername    string  `gorm:"column:invitee_username"`
	InviteeDisplayName string  `gorm:"column:invitee_display_name"`
	InviteeEmail       string  `gorm:"column:invitee_email"`
	RewardRate         int     `gorm:"column:reward_rate"`
	ConsumedQuota      int     `gorm:"column:consumed_quota"`
	ConsumedAmountUSD  float64 `gorm:"column:consumed_amount_usd"`
	RewardQuota        int     `gorm:"column:reward_quota"`
	CreatedAt          int64   `gorm:"column:created_at"`
}

type promotionAggregate struct {
	TotalConsumedQuota     int     `gorm:"column:total_consumed_quota"`
	TotalConsumedAmountUSD float64 `gorm:"column:total_consumed_amount_usd"`
	TotalCommissionQuota   int     `gorm:"column:total_commission_quota"`
}

func rewardRateFromSettings() int {
	if common.QuotaForInviter < 0 {
		return 0
	}
	if common.QuotaForInviter > 100 {
		return 100
	}
	return common.QuotaForInviter
}

func rewardQuotaByConsume(consumedQuota int) int {
	rate := rewardRateFromSettings()
	if consumedQuota <= 0 || rate <= 0 {
		return 0
	}
	return int((int64(consumedQuota) * int64(rate)) / 100)
}

func amountToQuota(amountUSD float64) int {
	if amountUSD <= 0 || common.QuotaPerUnit <= 0 {
		return 0
	}
	return int(
		decimal.NewFromFloat(amountUSD).
			Mul(decimal.NewFromFloat(common.QuotaPerUnit)).
			IntPart(),
	)
}

func quotaToAmount(quota int) float64 {
	if quota <= 0 || common.QuotaPerUnit <= 0 {
		return 0
	}
	return decimal.NewFromInt(int64(quota)).
		Div(decimal.NewFromFloat(common.QuotaPerUnit)).
		InexactFloat64()
}

func parsePromotionAmount(value any) float64 {
	switch typed := value.(type) {
	case float64:
		return typed
	case float32:
		return float64(typed)
	case int:
		return float64(typed)
	case int32:
		return float64(typed)
	case int64:
		return float64(typed)
	case uint:
		return float64(typed)
	case uint32:
		return float64(typed)
	case uint64:
		return float64(typed)
	case string:
		parsed, err := strconv.ParseFloat(typed, 64)
		if err == nil {
			return parsed
		}
	}
	return 0
}

func normalizeRechargeMetrics(logEntry *Log) (int, float64) {
	if logEntry == nil {
		return 0, 0
	}

	rechargeQuota := logEntry.Quota
	rechargeAmountUSD := 0.0
	rechargeCreditAmount := 0.0
	rechargeUnitPrice := 0.0
	if logEntry.Other != "" {
		if otherMap, err := common.StrToMap(logEntry.Other); err == nil {
			rechargeAmountUSD = parsePromotionAmount(otherMap["topup_amount_usd"])
			rechargeCreditAmount = parsePromotionAmount(otherMap["topup_credit_amount"])
			rechargeUnitPrice = parsePromotionAmount(otherMap["topup_unit_price"])
		}
	}
	if rechargeCreditAmount <= 0 && rechargeAmountUSD > 0 && rechargeUnitPrice > 0 {
		rechargeCreditAmount = decimal.NewFromFloat(rechargeAmountUSD).
			Div(decimal.NewFromFloat(rechargeUnitPrice)).
			InexactFloat64()
	}
	if rechargeCreditAmount > 0 {
		rechargeQuota = amountToQuota(rechargeCreditAmount)
	} else {
		if rechargeAmountUSD <= 0 && rechargeQuota > 0 {
			rechargeAmountUSD = quotaToAmount(rechargeQuota)
		}
		if rechargeQuota <= 0 && rechargeAmountUSD > 0 {
			rechargeQuota = amountToQuota(rechargeAmountUSD)
		}
	}
	return rechargeQuota, rechargeAmountUSD
}

func rewardQuotaByRecharge(rechargeQuota int, rechargeAmountUSD float64) int {
	if rechargeQuota > 0 {
		return rewardQuotaByConsume(rechargeQuota)
	}
	return rewardQuotaByConsume(amountToQuota(rechargeAmountUSD))
}

func RewardAffiliateByTopupLog(logEntry *Log) error {
	if logEntry == nil || logEntry.Id == 0 {
		return nil
	}
	if logEntry.Type != LogTypeTopup {
		return nil
	}
	rewardRate := rewardRateFromSettings()
	if rewardRate <= 0 {
		return nil
	}

	rechargeQuota, rechargeAmountUSD := normalizeRechargeMetrics(logEntry)
	if rechargeQuota <= 0 && rechargeAmountUSD <= 0 {
		return nil
	}

	var invitee struct {
		Id        int
		InviterId int
	}
	if err := DB.Model(&User{}).
		Select("id", "inviter_id").
		Where("id = ?", logEntry.UserId).
		Take(&invitee).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil
		}
		return err
	}
	if invitee.InviterId == 0 {
		return nil
	}

	rewardQuota := rewardQuotaByRecharge(rechargeQuota, rechargeAmountUSD)
	if rewardQuota <= 0 {
		return nil
	}

	record := &AffRewardRecord{
		InviterId:         invitee.InviterId,
		InviteeId:         invitee.Id,
		SourceLogId:       logEntry.Id,
		SourceLogType:     logEntry.Type,
		SourceRequestId:   logEntry.RequestId,
		ConsumedQuota:     rechargeQuota,
		ConsumedAmountUSD: rechargeAmountUSD,
		RewardRate:        rewardRate,
		RewardQuota:       rewardQuota,
		CreatedAt:         logEntry.CreatedAt,
	}

	return DB.Transaction(func(tx *gorm.DB) error {
		result := tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "source_log_id"}},
			DoNothing: true,
		}).Create(record)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return nil
		}

		updateResult := tx.Model(&User{}).
			Where("id = ?", invitee.InviterId).
			Updates(map[string]any{
				"aff_quota":   gorm.Expr("aff_quota + ?", rewardQuota),
				"aff_history": gorm.Expr("aff_history + ?", rewardQuota),
			})
		if updateResult.Error != nil {
			return updateResult.Error
		}
		if updateResult.RowsAffected == 0 {
			return fmt.Errorf("inviter not found: %d", invitee.InviterId)
		}

		return nil
	})
}

func GetPromotionOverview(userId int) (*PromotionOverview, error) {
	overview := &PromotionOverview{
		CommissionRate:    rewardRateFromSettings(),
		InviteeBonusQuota: common.QuotaForInvitee,
	}

	var registeredInviteeCount int64
	if err := DB.Model(&User{}).
		Where("inviter_id = ?", userId).
		Count(&registeredInviteeCount).Error; err != nil {
		return nil, err
	}
	overview.RegisteredInviteeCount = int(registeredInviteeCount)

	var consumedInviteeCount int64
	if err := DB.Model(&AffRewardRecord{}).
		Where("inviter_id = ? AND source_log_type = ?", userId, LogTypeTopup).
		Distinct("invitee_id").
		Count(&consumedInviteeCount).Error; err != nil {
		return nil, err
	}
	overview.ConsumedInviteeCount = int(consumedInviteeCount)

	aggregate := &promotionAggregate{}
	if err := DB.Model(&AffRewardRecord{}).
		Where("inviter_id = ? AND source_log_type = ?", userId, LogTypeTopup).
		Select(
			"COALESCE(SUM(consumed_quota), 0) AS total_consumed_quota, " +
				"COALESCE(SUM(consumed_amount_usd), 0) AS total_consumed_amount_usd, " +
				"COALESCE(SUM(reward_quota), 0) AS total_commission_quota",
		).
		Scan(aggregate).Error; err != nil {
		return nil, err
	}

	overview.TotalConsumedQuota = aggregate.TotalConsumedQuota
	overview.TotalConsumedAmountUSD = aggregate.TotalConsumedAmountUSD
	overview.TotalCommissionQuota = aggregate.TotalCommissionQuota

	return overview, nil
}

func GetPromotionInvitees(userId int, keyword string, pageInfo *common.PageInfo) ([]*PromotionInvitee, int64, error) {
	baseQuery := DB.Table("aff_reward_records AS arr").
		Joins("JOIN users u ON u.id = arr.invitee_id").
		Where("arr.inviter_id = ? AND arr.source_log_type = ?", userId, LogTypeTopup)

	if keyword != "" {
		like := "%" + keyword + "%"
		baseQuery = baseQuery.Where(
			"u.username LIKE ? OR u.display_name LIKE ? OR u.email LIKE ?",
			like, like, like,
		)
	}

	var total int64
	if err := baseQuery.Distinct("arr.invitee_id").Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var invitees []*PromotionInvitee
	query := DB.Table("aff_reward_records AS arr").
		Select(
			"u.id AS invitee_id, u.username, u.display_name, u.email, u.status, "+
				"COUNT(arr.id) AS reward_count, "+
				"COALESCE(SUM(arr.consumed_quota), 0) AS total_consumed_quota, "+
				"COALESCE(SUM(arr.consumed_amount_usd), 0) AS total_consumed_amount_usd, "+
				"COALESCE(SUM(arr.reward_quota), 0) AS total_reward_quota, "+
				"MIN(arr.created_at) AS first_consume_time, "+
				"MAX(arr.created_at) AS last_consume_time",
		).
		Joins("JOIN users u ON u.id = arr.invitee_id").
		Where("arr.inviter_id = ? AND arr.source_log_type = ?", userId, LogTypeTopup)

	if keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where(
			"u.username LIKE ? OR u.display_name LIKE ? OR u.email LIKE ?",
			like, like, like,
		)
	}

	err := query.
		Group("u.id, u.username, u.display_name, u.email, u.status").
		Order("last_consume_time DESC").
		Limit(pageInfo.GetPageSize()).
		Offset(pageInfo.GetStartIdx()).
		Find(&invitees).Error
	if err != nil {
		return nil, 0, err
	}

	return invitees, total, nil
}

func GetPromotionRewardRecords(keyword string, pageInfo *common.PageInfo) ([]*PromotionRewardRecord, int64, error) {
	baseQuery := DB.Table("aff_reward_records AS arr").
		Joins("JOIN users inviter ON inviter.id = arr.inviter_id").
		Joins("JOIN users invitee ON invitee.id = arr.invitee_id").
		Where("arr.source_log_type = ?", LogTypeTopup)

	if keyword != "" {
		like := "%" + keyword + "%"
		baseQuery = baseQuery.Where(
			"inviter.username LIKE ? OR inviter.display_name LIKE ? OR inviter.email LIKE ? OR invitee.username LIKE ? OR invitee.display_name LIKE ? OR invitee.email LIKE ? OR arr.source_request_id LIKE ?",
			like, like, like, like, like, like, like,
		)
	}

	var total int64
	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var rows []*promotionRewardRecordRow
	err := DB.Table("aff_reward_records AS arr").
		Select(
			"arr.id, arr.source_log_id, arr.source_request_id, arr.inviter_id, arr.invitee_id, arr.reward_rate, arr.consumed_quota, arr.consumed_amount_usd, arr.reward_quota, arr.created_at, "+
				"inviter.username AS inviter_username, inviter.display_name AS inviter_display_name, inviter.email AS inviter_email, "+
				"invitee.username AS invitee_username, invitee.display_name AS invitee_display_name, invitee.email AS invitee_email",
		).
		Joins("JOIN users inviter ON inviter.id = arr.inviter_id").
		Joins("JOIN users invitee ON invitee.id = arr.invitee_id").
		Where("arr.source_log_type = ?", LogTypeTopup).
		Scopes(func(db *gorm.DB) *gorm.DB {
			if keyword == "" {
				return db
			}
			like := "%" + keyword + "%"
			return db.Where(
				"inviter.username LIKE ? OR inviter.display_name LIKE ? OR inviter.email LIKE ? OR invitee.username LIKE ? OR invitee.display_name LIKE ? OR invitee.email LIKE ? OR arr.source_request_id LIKE ?",
				like, like, like, like, like, like, like,
			)
		}).
		Order("arr.created_at DESC").
		Limit(pageInfo.GetPageSize()).
		Offset(pageInfo.GetStartIdx()).
		Find(&rows).Error
	if err != nil {
		return nil, 0, err
	}

	records := make([]*PromotionRewardRecord, 0, len(rows))
	for _, row := range rows {
		if row == nil {
			continue
		}

		creditAmountUSD := quotaToAmount(row.ConsumedQuota)
		rewardAmountUSD := quotaToAmount(row.RewardQuota)
		rewardAmount := 0.0

		if creditAmountUSD > 0 && row.ConsumedAmountUSD > 0 {
			rewardAmount = decimal.NewFromFloat(rewardAmountUSD).
				Mul(decimal.NewFromFloat(row.ConsumedAmountUSD)).
				Div(decimal.NewFromFloat(creditAmountUSD)).
				InexactFloat64()
		} else if row.RewardRate > 0 && row.ConsumedAmountUSD > 0 {
			rewardAmount = decimal.NewFromFloat(row.ConsumedAmountUSD).
				Mul(decimal.NewFromInt(int64(row.RewardRate))).
				Div(decimal.NewFromInt(100)).
				InexactFloat64()
		}

		records = append(records, &PromotionRewardRecord{
			Id:                 row.Id,
			SourceLogId:        row.SourceLogId,
			SourceRequestId:    row.SourceRequestId,
			InviterId:          row.InviterId,
			InviterUsername:    row.InviterUsername,
			InviterDisplayName: row.InviterDisplayName,
			InviterEmail:       row.InviterEmail,
			InviteeId:          row.InviteeId,
			InviteeUsername:    row.InviteeUsername,
			InviteeDisplayName: row.InviteeDisplayName,
			InviteeEmail:       row.InviteeEmail,
			RewardRate:         row.RewardRate,
			PaidAmount:         row.ConsumedAmountUSD,
			CreditAmountUSD:    creditAmountUSD,
			RewardAmount:       rewardAmount,
			RewardAmountUSD:    rewardAmountUSD,
			ConsumedQuota:      row.ConsumedQuota,
			RewardQuota:        row.RewardQuota,
			CreatedAt:          row.CreatedAt,
		})
	}

	return records, total, nil
}
