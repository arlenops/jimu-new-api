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
import { Card, Avatar, Skeleton, Tag } from '@douyinfe/semi-ui';
import { VChart } from '@visactor/react-vchart';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StatsCards = ({
  groupedStatsData,
  loading,
  getTrendSpec,
  CARD_PROPS,
  CHART_CONFIG,
  standalone = false,
  topUpRoute = '/console/topup',
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className='mb-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {groupedStatsData.map((group, idx) => (
          <Card
            key={idx}
            {...CARD_PROPS}
            className={`${standalone ? 'va-standalone-stat-card' : group.color} border-0 !rounded-2xl w-full`}
            title={group.title}
          >
            <div
              className='space-y-4'
              style={standalone ? { color: 'var(--va-text)' } : undefined}
            >
              {group.items.map((item, itemIdx) => {
                const hasTrend =
                  Array.isArray(item.trendData) &&
                  item.trendData.some((value) => Number(value) > 0);
                const showTrendChart =
                  !standalone && (loading || hasTrend);

                return (
                  <div
                    key={itemIdx}
                    className='flex items-center justify-between cursor-pointer'
                    onClick={item.onClick}
                  >
                    <div className='flex items-center'>
                      <Avatar
                        className='mr-3'
                        size='small'
                        color={item.avatarColor}
                      >
                        {item.icon}
                      </Avatar>
                      <div>
                        <div
                          className={
                            standalone
                              ? 'text-xs text-[var(--va-text-soft)]'
                              : 'text-xs text-gray-500'
                          }
                        >
                          {item.title}
                        </div>
                        <div className='text-lg font-semibold'>
                          <Skeleton
                            loading={loading}
                            active
                            placeholder={
                              <Skeleton.Paragraph
                                active
                                rows={1}
                                style={{
                                  width: '65px',
                                  height: '24px',
                                  marginTop: '4px',
                                }}
                              />
                            }
                          >
                            {item.value}
                          </Skeleton>
                        </div>
                      </div>
                    </div>
                    {item.title === t('当前余额') ? (
                      <Tag
                        color='white'
                        shape='circle'
                        size='large'
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(topUpRoute);
                        }}
                        className={standalone ? 'va-standalone-balance-tag' : ''}
                      >
                        {t('充值')}
                      </Tag>
                    ) : showTrendChart ? (
                      <div className='w-24 h-10'>
                        <VChart
                          spec={getTrendSpec(item.trendData, item.trendColor)}
                          option={CHART_CONFIG}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
