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
import { Link, useLocation } from 'react-router-dom';
import SkeletonWrapper from '../components/SkeletonWrapper';

const Navigation = ({
  mainNavLinks,
  isMobile,
  isLoading,
  userState,
  pricingRequireAuth,
  invertColors = false,
  centeredDesktop = false,
}) => {
  const location = useLocation();

  const isLinkActive = (link) => {
    if (!link?.to) {
      return false;
    }

    const pathname = location.pathname;

    if (link.itemKey === 'home') {
      return pathname === '/';
    }

    if (link.itemKey === 'console') {
      return pathname === '/console' || pathname.startsWith('/console/');
    }

    return pathname === link.to || pathname.startsWith(`${link.to}/`);
  };

  const renderNavLinks = () => {
    const baseClasses =
      'va-header-nav-link flex-shrink-0 flex items-center gap-1 rounded-xl transition-all duration-200 ease-in-out';
    const colorClasses = invertColors
      ? 'text-[#111827] hover:text-[#00b26b] font-medium'
      : 'font-semibold hover:text-semi-color-primary';
    const spacingClasses = isMobile ? 'px-3 py-2' : 'px-3 py-2';

    const commonLinkClasses = `${baseClasses} ${spacingClasses} ${colorClasses}`;

    return mainNavLinks.map((link) => {
      const linkContent = <span>{link.text}</span>;
      const activeClassName = isLinkActive(link) ? ' is-active' : '';

      if (link.isExternal) {
        return (
          <a
            key={link.itemKey}
            href={link.externalLink}
            target='_blank'
            rel='noopener noreferrer'
            className={commonLinkClasses}
          >
            {linkContent}
          </a>
        );
      }

      let targetPath = link.to;
      if (
        ['console', 'dashboard', 'dengKingRanking', 'tokenManagement', 'usageLogs', 'walletManagement', 'promotionCenter'].includes(
          link.itemKey,
        ) &&
        !userState.user
      ) {
        targetPath = '/login';
      }
      if (link.itemKey === 'pricing' && pricingRequireAuth && !userState.user) {
        targetPath = '/login';
      }

      return (
        <Link
          key={link.itemKey}
          to={targetPath}
          className={`${commonLinkClasses}${activeClassName}`}
          aria-current={isLinkActive(link) ? 'page' : undefined}
        >
          {linkContent}
        </Link>
      );
    });
  };

  const navClassName = centeredDesktop
    ? 'flex flex-1 items-center gap-1 lg:gap-2 mx-2 md:absolute md:left-1/2 md:-translate-x-1/2 md:flex-none md:justify-center md:mx-0 md:max-w-[calc(100%-22rem)] overflow-x-auto whitespace-nowrap scrollbar-hide'
    : 'flex flex-1 items-center gap-1 lg:gap-2 mx-2 md:mx-4 overflow-x-auto whitespace-nowrap scrollbar-hide';

  return (
    <nav className={navClassName}>
      <SkeletonWrapper
        loading={isLoading}
        type='navigation'
        count={4}
        width={60}
        height={16}
        isMobile={isMobile}
      >
        {renderNavLinks()}
      </SkeletonWrapper>
    </nav>
  );
};

export default Navigation;
