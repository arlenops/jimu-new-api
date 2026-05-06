import React from 'react';
import { useTranslation } from 'react-i18next';
import TopUp from '../../components/topup';
import StandalonePageShell from '../../components/common/layout/StandalonePageShell';

const StandaloneWalletManagement = () => {
  const { t } = useTranslation();

  return (
    <StandalonePageShell
      showHero={false}
      eyebrow={t('Quota Funding')}
      title={t('钱包管理')}
      description={t(
        '把充值、兑换码和账单管理收进统一资金面板里，推广奖励单独移动到推广中心。',
      )}
      badge={`${t('Billing')} · ${t('单页视图')}`}
    >
      <TopUp embedded showRecharge={true} showInvitation={false} />
    </StandalonePageShell>
  );
};

export default StandaloneWalletManagement;
