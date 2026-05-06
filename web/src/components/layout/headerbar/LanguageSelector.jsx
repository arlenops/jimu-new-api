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

import React from 'react';
import { Button, Dropdown } from '@douyinfe/semi-ui';
import { Languages } from 'lucide-react';

const LanguageSelector = ({
  currentLang,
  onLanguageChange,
  t,
  invertColors = false,
}) => {
  const menuClass = invertColors
    ? '!rounded-lg !border !border-[rgba(15,23,42,0.1)] !bg-[rgba(255,255,255,0.96)] !shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl'
    : '!bg-semi-color-bg-overlay !border-semi-color-border !shadow-lg !rounded-lg dark:!bg-gray-700 dark:!border-gray-600';
  const itemClass = (lang) =>
    invertColors
      ? `!px-3 !py-1.5 !text-sm !text-[#111827] ${currentLang === lang ? '!bg-[rgba(0,178,107,0.12)] !text-[#00b26b] !font-semibold' : 'hover:!bg-[rgba(0,178,107,0.06)]'}`
      : `!px-3 !py-1.5 !text-sm !text-semi-color-text-0 dark:!text-gray-200 ${currentLang === lang ? '!bg-semi-color-primary-light-default dark:!bg-blue-600 !font-semibold' : 'hover:!bg-semi-color-fill-1 dark:hover:!bg-gray-600'}`;

  return (
    <Dropdown
      position='bottomRight'
      render={
        <Dropdown.Menu className={menuClass}>
          {/* Language sorting: Order by English name (Chinese, English, French, Japanese, Russian) */}
          <Dropdown.Item
            onClick={() => onLanguageChange('zh-CN')}
            className={itemClass('zh-CN')}
          >
            简体中文
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('zh-TW')}
            className={itemClass('zh-TW')}
          >
        	繁體中文
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('en')}
            className={itemClass('en')}
          >
            English
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('fr')}
            className={itemClass('fr')}
          >
            Français
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('ja')}
            className={itemClass('ja')}
          >
            日本語
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('ru')}
            className={itemClass('ru')}
          >
            Русский
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('vi')}
            className={itemClass('vi')}
          >
            Tiếng Việt
          </Dropdown.Item>
        </Dropdown.Menu>
      }
    >
      <Button
        icon={<Languages size={18} />}
        aria-label={t('common.changeLanguage')}
        theme='borderless'
        type='tertiary'
        className={`!p-1.5 !rounded-full ${invertColors ? '!text-[#111827] !bg-[rgba(255,255,255,0.78)] hover:!bg-[rgba(0,178,107,0.08)]' : '!text-current focus:!bg-semi-color-fill-1 dark:focus:!bg-gray-700 !bg-semi-color-fill-0 dark:!bg-semi-color-fill-1 hover:!bg-semi-color-fill-1 dark:hover:!bg-semi-color-fill-2'}`}
      />
    </Dropdown>
  );
};

export default LanguageSelector;
