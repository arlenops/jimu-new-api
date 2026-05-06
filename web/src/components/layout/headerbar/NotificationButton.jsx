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
import { Button, Badge } from '@douyinfe/semi-ui';
import { Megaphone } from 'lucide-react';

const NotificationButton = ({ unreadCount, onNoticeOpen, t, invertColors = false }) => {
  const buttonProps = {
    icon: <Megaphone size={16} />,
    'aria-label': t('系统公告'),
    onClick: onNoticeOpen,
    theme: 'light',
    type: 'tertiary',
    className: invertColors
      ? '!h-10 !w-10 !min-w-[40px] !rounded-full !border !border-[rgba(15,23,42,0.08)] !bg-[rgba(255,255,255,0.82)] !px-0 !text-[#111827] hover:!bg-[rgba(0,178,107,0.08)]'
      : '!h-10 !w-10 !min-w-[40px] !rounded-full !border !border-semi-color-border !bg-semi-color-fill-0 !px-0 !text-current hover:!bg-semi-color-fill-1 dark:!border-gray-700 dark:!bg-semi-color-fill-1 dark:hover:!bg-semi-color-fill-2',
  };

  if (unreadCount > 0) {
    return (
      <Badge count={unreadCount} type='danger' overflowCount={99}>
        <Button {...buttonProps} />
      </Badge>
    );
  }

  return <Button {...buttonProps} />;
};

export default NotificationButton;
