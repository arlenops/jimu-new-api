/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import { useMemo } from 'react';

export const useNavigation = (t, _docsLink, headerNavModules, userState) => {
  const mainNavLinks = useMemo(() => {
    // 默认配置，如果没有传入配置则显示所有模块
    const defaultModules = {
      home: true,
      console: true,
      dashboard: true,
      dengKingRanking: true,
      tokenManagement: true,
      usageLogs: true,
      walletManagement: true,
      promotionCenter: true,
      pricing: true,
      docs: true,
      about: true,
    };

    const modules = headerNavModules || defaultModules;

    const isEnabled = (key) => {
      if (modules[key] === undefined) {
        return defaultModules[key] === true;
      }
      return modules[key] === true;
    };

    const allLinks = [
      {
        text: t('首页'),
        itemKey: 'home',
        to: '/',
      },
      {
        text: t('控制台'),
        itemKey: 'console',
        to: '/console',
      },
      {
        text: t('数据'),
        itemKey: 'dashboard',
        to: '/dashboard',
      },
      {
        text: t('令牌'),
        itemKey: 'tokenManagement',
        to: '/token-management',
      },
      {
        text: t('日志'),
        itemKey: 'usageLogs',
        to: '/usage-logs',
      },
      {
        text: t('钱包'),
        itemKey: 'walletManagement',
        to: '/wallet-management',
      },
      {
        text: t('推广'),
        itemKey: 'promotionCenter',
        to: '/promotion-center',
      },
      {
        text: t('模型'),
        itemKey: 'pricing',
        to: '/pricing',
      },
      {
        text: t('排行'),
        itemKey: 'dengKingRanking',
        to: '/dengwang-ranking',
      },
      {
        text: t('关于'),
        itemKey: 'about',
        to: '/about',
      },
    ];

    return allLinks.filter((link) => {
      if (link.itemKey === 'console') {
        const isAdminUser = Number(userState?.user?.role || 0) >= 10;
        return isAdminUser && isEnabled(link.itemKey);
      }
      if (link.itemKey === 'pricing') {
        // 支持新的pricing配置格式
        return typeof modules.pricing === 'object'
          ? modules.pricing.enabled
          : modules.pricing;
      }
      return isEnabled(link.itemKey);
    });
  }, [t, headerNavModules, userState]);

  return {
    mainNavLinks,
  };
};
