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
import { useTranslation } from 'react-i18next';
import StandalonePageShell from '../../components/common/layout/StandalonePageShell';
import ModelPricingPage from '../../components/table/model-pricing/layout/PricingPage';

const Pricing = () => {
  const { t } = useTranslation();

  return (
    <StandalonePageShell
      showHero={false}
      contentWidthClass='max-w-[1600px]'
      eyebrow={t('Model Marketplace')}
      title={t('模型广场')}
      description={t(
        '把供应商筛选、模型卡片和价格视图收进统一的暗色工作台里，和首页及其他独立页保持同一套 VoltAgent 视觉。',
      )}
      badge={`${t('Model Catalog')} · ${t('单页视图')}`}
    >
      <ModelPricingPage standalone />
    </StandalonePageShell>
  );
};

export default Pricing;
