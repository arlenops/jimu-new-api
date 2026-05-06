import React from 'react';
import { useTranslation } from 'react-i18next';
import TopUp from '../../components/topup';
import StandalonePageShell from '../../components/common/layout/StandalonePageShell';

const StandalonePromotionCenter = () => {
  const { t } = useTranslation();

  return (
    <StandalonePageShell
      showHero={false}
      eyebrow={t('Promotion Center')}
      title={t('推广中心')}
      description={t(
        '把邀请奖励、推广链接和收益划转独立出来，单独查看推广数据，不再和充值流程混在一起。',
      )}
      badge={`${t('Referral')} · ${t('单页视图')}`}
    >
      <TopUp embedded showRecharge={false} showInvitation={true} />
    </StandalonePageShell>
  );
};

export default StandalonePromotionCenter;
