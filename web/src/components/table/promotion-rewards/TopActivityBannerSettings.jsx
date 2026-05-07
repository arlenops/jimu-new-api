import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Input,
  Space,
  Switch,
  TextArea,
  Typography,
} from '@douyinfe/semi-ui';
import { Megaphone, Save, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TopActivityBanner from '../../layout/TopActivityBanner';
import {
  API,
  isRoot,
  showError,
  showSuccess,
} from '../../../helpers';
import { StatusContext } from '../../../context/Status';

const { Text, Title } = Typography;

const defaultBanner = {
  enabled: true,
  label: '限时活动',
  content: '今日限时 Codex 分组消耗 0.7 倍',
  cta_text: '立即体验',
  cta_link: '/token-management',
  start_time: '',
  end_time: '',
};

const parseBanner = (value) => {
  if (!value) return defaultBanner;
  try {
    return {
      ...defaultBanner,
      ...JSON.parse(value),
    };
  } catch (error) {
    return defaultBanner;
  }
};

const TopActivityBannerSettings = () => {
  const { t } = useTranslation();
  const [statusState, statusDispatch] = useContext(StatusContext);
  const [banner, setBanner] = useState(defaultBanner);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const rootUser = useMemo(() => isRoot(), []);

  const updateBanner = (key, value) => {
    setBanner((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const loadBanner = async () => {
    if (!rootUser) return;
    setLoading(true);
    try {
      const res = await API.get('/api/option/');
      const { success, message, data } = res.data;
      if (!success) {
        showError(message || t('加载顶部活动公告失败'));
        return;
      }
      const option = (data || []).find(
        (item) => item.key === 'console_setting.top_activity_banner',
      );
      setBanner(parseBanner(option?.value));
    } catch (error) {
      showError(error.message || t('加载顶部活动公告失败'));
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async (nextBanner) => {
    try {
      const res = await API.get('/api/status');
      const { success, data } = res.data;
      if (success) {
        statusDispatch({ type: 'set', payload: data });
        return;
      }
    } catch (error) {
      // Fall back to local status patch below.
    }
    statusDispatch({
      type: 'set',
      payload: {
        ...(statusState?.status || {}),
        top_activity_banner: nextBanner?.enabled
          ? nextBanner
          : { enabled: false },
      },
    });
  };

  const saveBanner = async () => {
    setSaving(true);
    try {
      const nextBanner = {
        ...banner,
        label: banner.label.trim(),
        content: banner.content.trim(),
        cta_text: banner.cta_text.trim(),
        cta_link: banner.cta_link.trim(),
        start_time: banner.start_time.trim(),
        end_time: banner.end_time.trim(),
      };
      const res = await API.put('/api/option/', {
        key: 'console_setting.top_activity_banner',
        value: JSON.stringify(nextBanner),
      });
      const { success, message } = res.data;
      if (!success) {
        showError(message || t('保存失败'));
        return;
      }
      setBanner(nextBanner);
      localStorage.removeItem('top_activity_banner_dismissed_key');
      await refreshStatus(nextBanner);
      showSuccess(t('顶部活动公告已保存'));
    } catch (error) {
      showError(error.message || t('保存失败'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadBanner().then();
  }, [rootUser]);

  if (!rootUser) {
    return null;
  }

  return (
    <Card
      className='va-activity-admin-card'
      loading={loading}
      style={{ marginTop: 16 }}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
          <div>
            <div className='mb-1 flex items-center gap-2 text-[var(--semi-color-text-0)]'>
              <Sparkles size={18} />
              <Title heading={5} style={{ margin: 0 }}>
                {t('顶部活动公告')}
              </Title>
            </div>
            <Text type='secondary'>
              {t('用于展示限时活动、倍率优惠等全站顶部通知。')}
            </Text>
          </div>
          <div className='flex items-center gap-2'>
            <Text strong>{t('启用')}</Text>
            <Switch
              checked={banner.enabled}
              onChange={(checked) => updateBanner('enabled', checked)}
            />
          </div>
        </div>

        <Divider margin='12px' />

        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <label className='va-activity-field'>
            <Text strong>{t('活动标签')}</Text>
            <Input
              value={banner.label}
              maxLength={24}
              onChange={(value) => updateBanner('label', value)}
              placeholder={t('限时活动')}
            />
          </label>
          <label className='va-activity-field'>
            <Text strong>{t('按钮文字')}</Text>
            <Input
              value={banner.cta_text}
              maxLength={20}
              onChange={(value) => updateBanner('cta_text', value)}
              placeholder={t('立即体验')}
            />
          </label>
          <label className='va-activity-field md:col-span-2'>
            <Text strong>{t('活动内容')}</Text>
            <TextArea
              autosize={{ minRows: 2, maxRows: 4 }}
              value={banner.content}
              maxCount={160}
              onChange={(value) => updateBanner('content', value)}
              placeholder={t('今日限时 Codex 分组消耗 0.7 倍')}
            />
          </label>
          <label className='va-activity-field md:col-span-2'>
            <Text strong>{t('跳转链接')}</Text>
            <Input
              value={banner.cta_link}
              onChange={(value) => updateBanner('cta_link', value)}
              placeholder='/token-management'
            />
          </label>
          <label className='va-activity-field'>
            <Text strong>{t('开始时间')}</Text>
            <Input
              type='datetime-local'
              value={banner.start_time}
              onChange={(value) => updateBanner('start_time', value)}
            />
          </label>
          <label className='va-activity-field'>
            <Text strong>{t('结束时间')}</Text>
            <Input
              type='datetime-local'
              value={banner.end_time}
              onChange={(value) => updateBanner('end_time', value)}
            />
          </label>
        </div>

        <div className='va-activity-preview-shell'>
          <div className='mb-2 flex items-center gap-2 text-[var(--semi-color-text-1)]'>
            <Megaphone size={16} />
            <Text strong>{t('实时预览')}</Text>
          </div>
          <TopActivityBanner
            banner={{
              ...banner,
              enabled: true,
            }}
            dismissible={false}
            preview={true}
            className='va-top-activity-preview'
          />
        </div>

        <Space>
          <Button
            theme='solid'
            type='primary'
            icon={<Save size={16} />}
            loading={saving}
            onClick={saveBanner}
          >
            {t('保存公告')}
          </Button>
          <Button
            type='tertiary'
            onClick={() =>
              setBanner({
                ...defaultBanner,
                enabled: banner.enabled,
              })
            }
          >
            {t('填充活动模板')}
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default TopActivityBannerSettings;
