package controller

import (
	"strings"

	"github.com/QuantumNous/new-api/setting/system_setting"
)

const walletManagementPath = "/wallet-management"

func walletManagementURL(query string) string {
	base := strings.TrimRight(system_setting.ServerAddress, "/") + walletManagementPath
	if query == "" {
		return base
	}
	if strings.HasPrefix(query, "?") {
		return base + query
	}
	return base + "?" + query
}
