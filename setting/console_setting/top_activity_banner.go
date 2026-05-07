package console_setting

import (
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
)

type TopActivityBanner struct {
	Enabled   bool   `json:"enabled"`
	Label     string `json:"label"`
	Content   string `json:"content"`
	CtaText   string `json:"cta_text"`
	CtaLink   string `json:"cta_link"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
}

var defaultTopActivityBanner = TopActivityBanner{
	Enabled:   false,
	Label:     "限时活动",
	Content:   "",
	CtaText:   "立即查看",
	CtaLink:   "/token-management",
	StartTime: "",
	EndTime:   "",
}

func normalizeTopActivityBanner(banner TopActivityBanner) TopActivityBanner {
	if strings.TrimSpace(banner.Label) == "" {
		banner.Label = defaultTopActivityBanner.Label
	}
	if strings.TrimSpace(banner.CtaText) == "" {
		banner.CtaText = defaultTopActivityBanner.CtaText
	}
	if strings.TrimSpace(banner.CtaLink) == "" {
		banner.CtaLink = defaultTopActivityBanner.CtaLink
	}
	return banner
}

func GetTopActivityBanner() TopActivityBanner {
	banner := defaultTopActivityBanner
	raw := strings.TrimSpace(GetConsoleSetting().TopActivityBanner)
	if raw == "" {
		return banner
	}
	if err := common.UnmarshalJsonStr(raw, &banner); err != nil {
		return defaultTopActivityBanner
	}
	return normalizeTopActivityBanner(banner)
}

func validateTopActivityBanner(raw string) error {
	if strings.TrimSpace(raw) == "" {
		return nil
	}

	var banner TopActivityBanner
	if err := common.UnmarshalJsonStr(raw, &banner); err != nil {
		return fmt.Errorf("顶部活动公告格式错误：%s", err.Error())
	}

	banner = normalizeTopActivityBanner(banner)
	if len(banner.Label) > 24 {
		return fmt.Errorf("顶部活动公告的标签长度不能超过24字符")
	}
	if len(banner.Content) > 160 {
		return fmt.Errorf("顶部活动公告的内容长度不能超过160字符")
	}
	if len(banner.CtaText) > 20 {
		return fmt.Errorf("顶部活动公告的按钮文字长度不能超过20字符")
	}
	if len(banner.CtaLink) > 500 {
		return fmt.Errorf("顶部活动公告的链接长度不能超过500字符")
	}
	if len(banner.StartTime) > 64 || len(banner.EndTime) > 64 {
		return fmt.Errorf("顶部活动公告的时间长度不能超过64字符")
	}
	if banner.Content == "" && banner.Enabled {
		return fmt.Errorf("启用顶部活动公告时必须填写内容")
	}

	lowerLink := strings.ToLower(strings.TrimSpace(banner.CtaLink))
	if lowerLink != "" &&
		!strings.HasPrefix(lowerLink, "/") &&
		!strings.HasPrefix(lowerLink, "#") &&
		!strings.HasPrefix(lowerLink, "http://") &&
		!strings.HasPrefix(lowerLink, "https://") {
		return fmt.Errorf("顶部活动公告链接格式不正确")
	}
	if lowerLink != "" &&
		(strings.HasPrefix(lowerLink, "http://") || strings.HasPrefix(lowerLink, "https://")) {
		if _, err := url.Parse(lowerLink); err != nil {
			return fmt.Errorf("顶部活动公告链接格式不正确：%s", err.Error())
		}
	}

	for _, text := range []struct {
		value string
		name  string
	}{
		{banner.Label, "标签"},
		{banner.Content, "内容"},
		{banner.CtaText, "按钮文字"},
	} {
		if err := checkDangerousContent(text.value, 1, "顶部活动公告"+text.name); err != nil {
			return err
		}
	}

	if banner.StartTime != "" {
		if _, err := time.Parse(time.RFC3339, banner.StartTime); err != nil {
			if _, err2 := time.Parse("2006-01-02T15:04", banner.StartTime); err2 != nil {
				return fmt.Errorf("顶部活动公告开始时间格式错误")
			}
		}
	}
	if banner.EndTime != "" {
		if _, err := time.Parse(time.RFC3339, banner.EndTime); err != nil {
			if _, err2 := time.Parse("2006-01-02T15:04", banner.EndTime); err2 != nil {
				return fmt.Errorf("顶部活动公告结束时间格式错误")
			}
		}
	}

	return nil
}
