import React from 'react';
import { useTranslation } from 'react-i18next';
import TokensPage from '../../components/table/tokens';
import StandalonePageShell from '../../components/common/layout/StandalonePageShell';

const StandaloneTokenManagement = () => {
  const { t } = useTranslation();

  return (
    <StandalonePageShell
      showHero={false}
      contentWidthClass='max-w-full xl:max-w-[80vw]'
      eyebrow={t('Credential Control')}
      title={t('令牌管理')}
      description={t(
        '统一查看、创建和导入令牌配置。配色、卡片和表格层次全部切到首页同款的暗色玻璃界面。',
      )}
      badge={`${t('Token Ops')} · CC Switch`}
    >
      <TokensPage />
    </StandalonePageShell>
  );
};

export default StandaloneTokenManagement;
