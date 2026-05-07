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
import { useHeaderBar } from '../../../hooks/common/useHeaderBar';
import { useNotifications } from '../../../hooks/common/useNotifications';
import { useNavigation } from '../../../hooks/common/useNavigation';
import NoticeModal from '../NoticeModal';
import TopActivityBanner from '../TopActivityBanner';
import MobileMenuButton from './MobileMenuButton';
import HeaderLogo from './HeaderLogo';
import Navigation from './Navigation';
import ActionButtons from './ActionButtons';

const HeaderBar = ({ onMobileMenuToggle, drawerOpen }) => {
  const {
    userState,
    statusState,
    isMobile,
    collapsed,
    logoLoaded,
    currentLang,
    isLoading,
    systemName,
    logo,
    isNewYear,
    isSelfUseMode,
    docsLink,
    isDemoSiteMode,
    isConsoleRoute,
    isHomeRoute,
    isVoltRoute,
    headerNavModules,
    pricingRequireAuth,
    logout,
    handleLanguageChange,
    handleMobileMenuToggle,
    navigate,
    t,
  } = useHeaderBar({ onMobileMenuToggle, drawerOpen });

  const {
    noticeVisible,
    unreadCount,
    handleNoticeOpen,
    handleNoticeClose,
    getUnreadKeys,
  } = useNotifications(statusState);

  const { mainNavLinks } = useNavigation(
    t,
    docsLink,
    headerNavModules,
    userState,
  );

  const mainHeaderClasses = isVoltRoute
    ? 'va-glass-header text-[#101828]'
    : 'va-default-header text-semi-color-text-0 transition-colors duration-300';

  return (
    <header className='relative z-50'>
      <NoticeModal
        visible={noticeVisible}
        onClose={handleNoticeClose}
        isMobile={isMobile}
        defaultTab={unreadCount > 0 ? 'system' : 'inApp'}
        unreadKeys={getUnreadKeys()}
      />

      <div className={mainHeaderClasses}>
        <div className='mx-auto w-full max-w-[1720px] px-4 md:px-6 lg:px-8'>
          <div className='relative flex items-center justify-between h-16'>
            <div className='relative z-[2] flex items-center'>
              <MobileMenuButton
                isConsoleRoute={isConsoleRoute}
                isMobile={isMobile}
                drawerOpen={drawerOpen}
                collapsed={collapsed}
                onToggle={handleMobileMenuToggle}
                t={t}
              />

              <HeaderLogo
                isMobile={isMobile}
                isConsoleRoute={isConsoleRoute}
                invertColors={isVoltRoute}
                logo={logo}
                logoLoaded={logoLoaded}
                isLoading={isLoading}
                systemName={systemName}
                isSelfUseMode={isSelfUseMode}
                isDemoSiteMode={isDemoSiteMode}
                t={t}
              />
            </div>

            <Navigation
              mainNavLinks={mainNavLinks}
              isMobile={isMobile}
              isLoading={isLoading}
              userState={userState}
              pricingRequireAuth={pricingRequireAuth}
              invertColors={isVoltRoute}
              centeredDesktop={true}
            />

            <div className='relative z-[2]'>
              <ActionButtons
                isNewYear={isNewYear}
                unreadCount={unreadCount}
                onNoticeOpen={handleNoticeOpen}
                currentLang={currentLang}
                onLanguageChange={handleLanguageChange}
                userState={userState}
                isLoading={isLoading}
                isMobile={isMobile}
                isSelfUseMode={isSelfUseMode}
                logout={logout}
                navigate={navigate}
                t={t}
                invertColors={isVoltRoute}
              />
            </div>
          </div>
        </div>
      </div>
      <TopActivityBanner banner={statusState?.status?.top_activity_banner} />
    </header>
  );
};

export default HeaderBar;
