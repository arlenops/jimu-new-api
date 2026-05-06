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
import { Card, Empty, Tabs, TabPane } from '@douyinfe/semi-ui';
import { PieChart } from 'lucide-react';
import { VChart } from '@visactor/react-vchart';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
} from '@douyinfe/semi-illustrations';

const ChartsPanel = ({
  activeChartTab,
  setActiveChartTab,
  spec_line,
  spec_model_line,
  spec_pie,
  spec_rank_bar,
  spec_user_rank,
  spec_user_trend,
  isAdminUser,
  CARD_PROPS,
  CHART_CONFIG,
  FLEX_CENTER_GAP2,
  hasApiInfoPanel,
  t,
  standalone = false,
}) => {
  const activeSpecMap = {
    '1': spec_line,
    '2': spec_model_line,
    '3': spec_pie,
    '4': spec_rank_bar,
    '5': spec_user_rank,
    '6': spec_user_trend,
  };

  const activeSpec = activeSpecMap[activeChartTab];
  const hasMeaningfulData =
    Array.isArray(activeSpec?.data) &&
    activeSpec.data.some(
      (dataset) =>
        Array.isArray(dataset?.values) &&
        dataset.values.some((entry) =>
          Object.values(entry || {}).some(
            (value) => typeof value === 'number' && value > 0,
          ),
        ),
    );

  return (
    <Card
      {...CARD_PROPS}
      className={`!rounded-2xl ${hasApiInfoPanel ? 'lg:col-span-3' : ''}`}
      title={
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-3'>
          <div className={FLEX_CENTER_GAP2}>
            <PieChart size={16} />
            {t('模型数据分析')}
          </div>
          <Tabs
            type='slash'
            activeKey={activeChartTab}
            onChange={setActiveChartTab}
          >
            <TabPane tab={<span>{t('消耗分布')}</span>} itemKey='1' />
            <TabPane tab={<span>{t('调用趋势')}</span>} itemKey='2' />
            <TabPane tab={<span>{t('调用次数分布')}</span>} itemKey='3' />
            <TabPane tab={<span>{t('调用次数排行')}</span>} itemKey='4' />
            {isAdminUser && (
              <TabPane tab={<span>{t('用户消耗排行')}</span>} itemKey='5' />
            )}
            {isAdminUser && (
              <TabPane tab={<span>{t('用户消耗趋势')}</span>} itemKey='6' />
            )}
          </Tabs>
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <div className={`h-96 p-2 ${standalone ? 'va-standalone-chart-stage' : ''}`}>
        {standalone && !hasMeaningfulData ? (
          <div className='va-standalone-chart-empty'>
            <Empty
              image={
                <IllustrationConstruction style={{ width: 108, height: 108 }} />
              }
              darkModeImage={
                <IllustrationConstructionDark style={{ width: 108, height: 108 }} />
              }
              title={t('暂无图表数据')}
              description={t(
                '当前没有足够的调用数据生成图表，先从令牌管理接入一次请求。',
              )}
            />
          </div>
        ) : null}

        {(!standalone || hasMeaningfulData) && activeChartTab === '1' && (
          <VChart spec={spec_line} option={CHART_CONFIG} />
        )}
        {(!standalone || hasMeaningfulData) && activeChartTab === '2' && (
          <VChart spec={spec_model_line} option={CHART_CONFIG} />
        )}
        {(!standalone || hasMeaningfulData) && activeChartTab === '3' && (
          <VChart spec={spec_pie} option={CHART_CONFIG} />
        )}
        {(!standalone || hasMeaningfulData) && activeChartTab === '4' && (
          <VChart spec={spec_rank_bar} option={CHART_CONFIG} />
        )}
        {(!standalone || hasMeaningfulData) && activeChartTab === '5' && isAdminUser && (
          <VChart spec={spec_user_rank} option={CHART_CONFIG} />
        )}
        {(!standalone || hasMeaningfulData) && activeChartTab === '6' && isAdminUser && (
          <VChart spec={spec_user_trend} option={CHART_CONFIG} />
        )}
      </div>
    </Card>
  );
};

export default ChartsPanel;
