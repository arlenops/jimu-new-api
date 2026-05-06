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

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Dropdown } from '@douyinfe/semi-ui';
import { ChevronDown } from 'lucide-react';
import {
  IconExit,
  IconUserSetting,
  IconCreditCard,
  IconKey,
} from '@douyinfe/semi-icons';
import { stringToColor } from '../../../helpers';
import SkeletonWrapper from '../components/SkeletonWrapper';

const UserArea = ({
  userState,
  isLoading,
  isMobile,
  isSelfUseMode,
  logout,
  navigate,
  t,
  invertColors = false,
}) => {
  const dropdownRef = useRef(null);
  const dropdownMenuClass = invertColors
    ? '!rounded-lg !border !border-[rgba(15,23,42,0.1)] !bg-[rgba(255,255,255,0.96)] !shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl'
    : '!bg-semi-color-bg-overlay !border-semi-color-border !shadow-lg !rounded-lg dark:!bg-gray-700 dark:!border-gray-600';
  const dropdownItemClass = invertColors
    ? '!px-3 !py-1.5 !text-sm !text-[#111827] hover:!bg-[rgba(0,178,107,0.06)]'
    : '!px-3 !py-1.5 !text-sm !text-semi-color-text-0 hover:!bg-semi-color-fill-1 dark:!text-gray-200 dark:hover:!bg-blue-500 dark:hover:!text-white';
  const logoutItemClass = invertColors
    ? '!px-3 !py-1.5 !text-sm !text-[#c2410c] hover:!bg-[rgba(251,113,133,0.12)]'
    : '!px-3 !py-1.5 !text-sm !text-semi-color-text-0 hover:!bg-semi-color-fill-1 dark:!text-gray-200 dark:hover:!bg-red-500 dark:hover:!text-white';
  const dropdownIconClass = invertColors
    ? 'text-[#6b7280]'
    : 'text-gray-500 dark:text-gray-400';
  const logoutIconClass = invertColors
    ? 'text-[#fb7185]'
    : 'text-gray-500 dark:text-gray-400';

  if (isLoading) {
    return (
      <SkeletonWrapper
        loading={true}
        type='userArea'
        width={50}
        isMobile={isMobile}
      />
    );
  }

  if (userState.user) {
    return (
      <div className='relative' ref={dropdownRef}>
        <Dropdown
          position='bottomRight'
          getPopupContainer={() => dropdownRef.current}
          render={
            <Dropdown.Menu className={dropdownMenuClass}>
              <Dropdown.Item
                onClick={() => {
                  navigate('/personal-settings');
                }}
                className={dropdownItemClass}
              >
                <div className='flex items-center gap-2'>
                  <IconUserSetting size='small' className={dropdownIconClass} />
                  <span>{t('个人设置')}</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  navigate('/token-management');
                }}
                className={dropdownItemClass}
              >
                <div className='flex items-center gap-2'>
                  <IconKey size='small' className={dropdownIconClass} />
                  <span>{t('令牌管理')}</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  navigate('/wallet-management');
                }}
                className={dropdownItemClass}
              >
                <div className='flex items-center gap-2'>
                  <IconCreditCard size='small' className={dropdownIconClass} />
                  <span>{t('钱包管理')}</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={logout}
                className={logoutItemClass}
              >
                <div className='flex items-center gap-2'>
                  <IconExit size='small' className={logoutIconClass} />
                  <span>{t('退出')}</span>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          <Button
            theme='borderless'
            type='tertiary'
            className={`flex items-center gap-1.5 !p-1 !rounded-full ${invertColors ? '!bg-[rgba(255,255,255,0.78)] hover:!bg-[rgba(0,178,107,0.08)]' : 'hover:!bg-semi-color-fill-1 dark:hover:!bg-gray-700 !bg-semi-color-fill-0 dark:!bg-semi-color-fill-1 dark:hover:!bg-semi-color-fill-2'}`}
          >
            <Avatar
              size='extra-small'
              color={stringToColor(userState.user.username)}
              className='mr-1'
            >
              {userState.user.username[0].toUpperCase()}
            </Avatar>
            <span
              className='hidden md:inline !text-xs !font-medium mr-1'
              style={{
                color: invertColors ? '#101828' : undefined,
              }}
            >
              {userState.user.username}
            </span>
            <ChevronDown
              size={14}
              className={`text-xs ${invertColors ? 'text-[#6b7280]' : 'text-semi-color-text-2 dark:text-gray-400'}`}
            />
          </Button>
        </Dropdown>
      </div>
    );
  } else {
    const showRegisterButton = !isSelfUseMode;

    const commonSizingAndLayoutClass =
      'flex items-center justify-center !py-[10px] !px-1.5';

    const loginButtonSpecificStyling =
      '!bg-semi-color-fill-0 dark:!bg-semi-color-fill-1 hover:!bg-semi-color-fill-1 dark:hover:!bg-gray-700 transition-colors';
    let loginButtonClasses = `${commonSizingAndLayoutClass} ${loginButtonSpecificStyling}`;

    let registerButtonClasses = `${commonSizingAndLayoutClass}`;

    const loginButtonTextSpanClass = invertColors
      ? '!text-xs !text-[#111827] !p-1.5'
      : '!text-xs !text-semi-color-text-1 dark:!text-gray-300 !p-1.5';
    const registerButtonTextSpanClass = '!text-xs !text-white !p-1.5';

    if (showRegisterButton) {
      if (isMobile) {
        loginButtonClasses += ' !rounded-full';
      } else {
        loginButtonClasses += ' !rounded-l-full !rounded-r-none';
      }
      registerButtonClasses += ' !rounded-r-full !rounded-l-none';
    } else {
      loginButtonClasses += ' !rounded-full';
    }

    return (
      <div className='flex items-center'>
        <Link to='/login' className='flex'>
          <Button
            theme='borderless'
            type='tertiary'
            className={`${loginButtonClasses} ${invertColors ? '!bg-[rgba(255,255,255,0.78)] hover:!bg-[rgba(0,178,107,0.08)] !text-[#111827]' : ''}`}
          >
            <span className={loginButtonTextSpanClass}>{t('登录')}</span>
          </Button>
        </Link>
        {showRegisterButton && (
          <div className='hidden md:block'>
            <Link to='/register' className='flex -ml-px'>
              <Button
                theme='solid'
                type='primary'
                className={`${registerButtonClasses} ${invertColors ? '!bg-[#00b26b] !border-[#00b26b] hover:!bg-[#00c476]' : ''}`}
              >
                <span className={registerButtonTextSpanClass}>{t('注册')}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }
};

export default UserArea;
