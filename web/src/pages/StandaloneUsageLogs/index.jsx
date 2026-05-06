import React from 'react';
import { useTranslation } from 'react-i18next';
import UsageLogsPage from '../../components/table/usage-logs';
import StandalonePageShell from '../../components/common/layout/StandalonePageShell';

const StandaloneUsageLogs = () => {
  const { t } = useTranslation();

  return (
    <StandalonePageShell
      showHero={false}
      contentWidthClass='max-w-full'
      eyebrow={t('Request Tracing')}
      title={t('使用日志')}
      description={t(
        '请求结果、额度消耗和排障入口收敛为同一套暗色运行视图，减少控制台与首页之间的割裂感。',
      )}
      badge={`${t('Usage Trace')} · RPM / TPM`}
    >
      <UsageLogsPage />
    </StandalonePageShell>
  );
};

export default StandaloneUsageLogs;
