import React from 'react';
import { useTranslation } from 'react-i18next';
import Dashboard from '../../components/dashboard';
import StandalonePageShell from '../../components/common/layout/StandalonePageShell';

const StandaloneDashboard = () => {
  const { t } = useTranslation();

  return (
    <StandalonePageShell
      showHero={false}
      eyebrow={t('Runtime Analytics')}
      title={t('数据看板')}
      description={t(
        '把核心运行指标、消费走势和接口状态集中到一个暗色工作台里，保持和首页一致的 VoltAgent 视觉语言。',
      )}
      badge={`${t('Live Overview')} · ${t('单页视图')}`}
    >
      <Dashboard standalone />
    </StandalonePageShell>
  );
};

export default StandaloneDashboard;
