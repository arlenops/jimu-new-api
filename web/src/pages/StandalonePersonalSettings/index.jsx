import React from 'react';
import { useTranslation } from 'react-i18next';
import PersonalSetting from '../../components/settings/PersonalSetting';
import StandalonePageShell from '../../components/common/layout/StandalonePageShell';

const StandalonePersonalSettings = () => {
  const { t } = useTranslation();

  return (
    <StandalonePageShell
      showHero={false}
      eyebrow={t('Profile Settings')}
      title={t('个人设置')}
      description={t(
        '把账户信息、签到、通知和偏好设置独立出来，单独管理自己的账户资料。',
      )}
      badge={`${t('Profile')} · ${t('单页视图')}`}
    >
      <PersonalSetting standalone={true} />
    </StandalonePageShell>
  );
};

export default StandalonePersonalSettings;
