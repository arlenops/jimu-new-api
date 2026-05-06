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

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import { API, getLobeHubIcon } from '../../helpers';
import { StatusContext } from '../../context/Status';
import {
  Gauge,
  Globe2,
  KeyRound,
  Sparkles,
  Zap,
} from 'lucide-react';

const voltAgentTheme = {
  '--va-bg': '#f5f7f2',
  '--va-surface': 'rgba(255,255,255,0.86)',
  '--va-surface-2': '#edf4ee',
  '--va-border': 'rgba(15,23,42,0.1)',
  '--va-border-strong': 'rgba(15,23,42,0.14)',
  '--va-text': '#101828',
  '--va-text-muted': '#4b5563',
  '--va-text-soft': '#6b7280',
  '--va-accent': '#00b26b',
  '--va-link': '#00a46a',
};

const defaultDocsLink = 'https://yiqiu.apifox.cn';

const homeModelPriority = [
  'gpt',
  'claude',
  'gemini',
  'deepseek',
  'qwen',
  'grok',
  'llama',
];

const buildHomeSupportedModels = (models = [], vendors = []) => {
  const vendorMap = vendors.reduce((map, vendor) => {
    map[vendor.id] = vendor;
    return map;
  }, {});

  const sortedModels = models
    .filter((model) => model?.model_name)
    .map((model) => {
      const vendor = vendorMap[model.vendor_id] || {};
      const modelName = model.model_name;
      const nameLower = modelName.toLowerCase();
      const priorityIndex = homeModelPriority.findIndex((keyword) =>
        nameLower.includes(keyword),
      );

      return {
        name: modelName,
        icon: model.icon || vendor.icon || 'Layers',
        vendor: vendor.name || '',
        priority: priorityIndex === -1 ? homeModelPriority.length : priorityIndex,
      };
    })
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));

  const featuredModels = homeModelPriority
    .map((keyword) =>
      sortedModels.find((model) => model.name.toLowerCase().includes(keyword)),
    )
    .filter(Boolean);
  const featuredNames = new Set(featuredModels.map((model) => model.name));

  return [
    ...featuredModels,
    ...sortedModels.filter((model) => !featuredNames.has(model.name)),
  ].slice(0, 16);
};

const buildModelMarqueeRow = (models = []) => {
  if (!models.length) {
    return { items: [], segmentLength: 0 };
  }

  let segment = [...models];
  while (segment.length < 8) {
    segment = [...segment, ...models];
  }

  return {
    items: [...segment, ...segment],
    segmentLength: segment.length,
  };
};

const Home = () => {
  const { t } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [uptimeGroups, setUptimeGroups] = useState([]);
  const [uptimeLoading, setUptimeLoading] = useState(false);
  const [supportedModels, setSupportedModels] = useState([]);

  const systemName =
    statusState?.status?.system_name || localStorage.getItem('system_name') || '亦秋AI中转站';
  const docsLink =
    statusState?.status?.docs_link ||
    localStorage.getItem('docs_link') ||
    defaultDocsLink;
  const serverAddress =
    statusState?.status?.server_address || window.location.origin;


  const uptimeMonitors = useMemo(
    () => uptimeGroups.flatMap((group) => group?.monitors || []),
    [uptimeGroups],
  );

  const visibleUptimeMonitors = useMemo(
    () => uptimeMonitors.slice(0, 5),
    [uptimeMonitors],
  );

  const modelMarqueeRows = useMemo(() => {
    if (!supportedModels.length) {
      return [];
    }

    const firstRow = supportedModels.filter((_, index) => index % 2 === 0);
    const secondRow = supportedModels.filter((_, index) => index % 2 === 1);

    return [
      buildModelMarqueeRow(firstRow),
      buildModelMarqueeRow(secondRow.length ? secondRow : [...firstRow].reverse()),
    ];
  }, [supportedModels]);

  const uptimeTotal = uptimeMonitors.length;
  const uptimeUp = uptimeMonitors.filter((monitor) => monitor.status === 1).length;
  const uptimeIssue = Math.max(0, uptimeTotal - uptimeUp);
  const uptimeAverage = uptimeTotal
    ? uptimeMonitors.reduce((sum, monitor) => sum + Number(monitor.uptime || 0), 0) / uptimeTotal
    : 0;
  const uptimePercent = uptimeTotal ? (uptimeAverage * 100).toFixed(2) : '--';

  const getMonitorStatus = (status) => {
    if (status === 1) return { label: t('可用'), className: 'is-up' };
    if (status === 2) return { label: t('高延迟'), className: 'is-warn' };
    if (status === 3) return { label: t('维护中'), className: 'is-maintenance' };
    return { label: t('异常'), className: 'is-down' };
  };

  const loadUptimeData = async () => {
    setUptimeLoading(true);
    try {
      const res = await API.get('/api/uptime/status');
      const { success, data } = res.data || {};
      if (success) {
        setUptimeGroups(data || []);
      }
    } catch (error) {
      setUptimeGroups([]);
    } finally {
      setUptimeLoading(false);
    }
  };


  const loadSupportedModels = async () => {
    try {
      const res = await API.get('/api/pricing');
      const { success, data, vendors } = res.data || {};
      if (success) {
        setSupportedModels(buildHomeSupportedModels(data || [], vendors || []));
      }
    } catch (error) {
      setSupportedModels([]);
    }
  };


  useEffect(() => {
    const lastCloseDate = localStorage.getItem('notice_close_date');
    const today = new Date().toDateString();
    if (lastCloseDate !== today) {
      setNoticeVisible(true);
    }
  }, []);


  useEffect(() => {
    loadUptimeData();
    loadSupportedModels();
  }, []);

  useEffect(() => {
    document.body.classList.add('va-standalone-mode');
    return () => {
      document.body.classList.remove('va-standalone-mode');
    };
  }, []);

  return (
    <div className='va-home-page' style={voltAgentTheme}>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        shouldShowTodayButton={true}
      />

      <section className='va-home-landing'>
        <div className='va-home-bg-grid' />
        <div className='va-home-orb is-green' />
        <div className='va-home-orb is-gold' />

        <div className='va-home-hero-v2'>
          <div className='va-home-hero-copy-v2'>
            <div className='va-home-pill-v2'>
              <Sparkles size={15} />
              <span>{t('AI API 网关与商业化中枢')}</span>
            </div>

            <h1 className='va-home-title-v2'>
              {t('简单、稳定、经济的 AI 工作入口，高效服务中')}
            </h1>

            <p className='va-home-subtitle-v2'>
              {t(
                '积木AI 将模型转发、渠道管理、用户体系、订阅计费与运营增长整合到一个现代化控制台，让 AI 服务上线更快、运营更清晰。',
              )}
            </p>

            <div className='va-home-actions-v2'>
              <Link to='/token-management'>
                <Button
                  size='large'
                  theme='solid'
                  icon={<Zap size={17} />}
                  className='va-home-primary-btn'
                >
                  {t('开始使用')}
                </Button>
              </Link>

              {docsLink ? (
                <a href={docsLink} target='_blank' rel='noreferrer'>
                  <Button
                    size='large'
                    theme='outline'
                    icon={<Globe2 size={17} />}
                    className='va-home-secondary-btn'
                  >
                    {t('查看文档')}
                  </Button>
                </a>
              ) : (
                <Link to='/token-management'>
                  <Button
                    size='large'
                    theme='outline'
                    icon={<KeyRound size={17} />}
                    className='va-home-secondary-btn'
                  >
                    {t('创建令牌')}
                  </Button>
                </Link>
              )}
            </div>

            <div className='va-home-endpoint-v2'>
              <span>{t('兼容接口')}</span>
              <code>{serverAddress}/v1</code>
            </div>

            {supportedModels.length > 0 && (
              <div className='va-home-models-v2'>
                <div className='va-home-models-head-v2'>
                  <span>{t('支持模型')}</span>
                  <small>{t('模型广场同步')}</small>
                </div>
                <div className='va-home-models-rail-v2'>
                  {modelMarqueeRows.map((row, rowIndex) => (
                    <div
                      className={`va-home-models-lane-v2 is-lane-${rowIndex + 1}`}
                      key={`model-lane-${rowIndex}`}
                    >
                      <div className='va-home-models-track-v2'>
                        {row.items.map((model, index) => (
                          <span
                            aria-hidden={index >= row.segmentLength}
                            className='va-home-model-chip-v2'
                            key={`${rowIndex}-${model.name}-${index}`}
                            title={model.name}
                          >
                            <span className='va-home-model-icon-v2'>
                              {getLobeHubIcon(model.icon, 18)}
                            </span>
                            <span>{model.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='va-home-visual-v2' aria-label={t('服务可用性')}>
            <div className='va-home-uptime-card'>
              <div className='va-home-uptime-head'>
                <div>
                  <span>{t('服务可用性')}</span>
                  <strong>{uptimeTotal ? t('实时监控中') : t('等待监控配置')}</strong>
                </div>
                <button
                  type='button'
                  className={`va-home-uptime-refresh ${uptimeLoading ? 'is-loading' : ''}`}
                  onClick={loadUptimeData}
                  aria-label={t('刷新')}
                >
                  <Gauge size={16} />
                </button>
              </div>

              <div className='va-home-uptime-hero'>
                <div className='va-home-uptime-score'>
                  <span>{t('综合可用率')}</span>
                  <strong>{uptimePercent}{uptimeTotal ? '%' : ''}</strong>
                  <p>{uptimeTotal ? t('近 24 小时服务状态') : t('请联系管理员在系统设置中配置Uptime')}</p>
                </div>
                <div className='va-home-uptime-rings'>
                  <div className='va-home-uptime-ring is-one' />
                  <div className='va-home-uptime-ring is-two' />
                  <div className='va-home-uptime-core'>
                    <span>{uptimeUp}</span>
                    <small>{t('可用')}</small>
                  </div>
                </div>
              </div>

              <div className='va-home-uptime-summary'>
                <div>
                  <span>{t('监控项')}</span>
                  <strong>{uptimeTotal || '--'}</strong>
                </div>
                <div>
                  <span>{t('正常')}</span>
                  <strong>{uptimeTotal ? uptimeUp : '--'}</strong>
                </div>
                <div>
                  <span>{t('异常')}</span>
                  <strong>{uptimeTotal ? uptimeIssue : '--'}</strong>
                </div>
              </div>

              <div className='va-home-uptime-list'>
                {visibleUptimeMonitors.length > 0 ? (
                  visibleUptimeMonitors.map((monitor, index) => {
                    const status = getMonitorStatus(monitor.status);
                    const percent = ((Number(monitor.uptime || 0)) * 100).toFixed(2);
                    return (
                      <div className='va-home-uptime-row' key={`${monitor.name}-${index}`}>
                        <div className={`va-home-uptime-dot ${status.className}`} />
                        <div className='va-home-uptime-row-main'>
                          <strong>{monitor.name}</strong>
                          <span>{monitor.group || t('默认分组')}</span>
                        </div>
                        <div className='va-home-uptime-row-status'>
                          <b>{percent}%</b>
                          <span>{status.label}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className='va-home-uptime-empty'>
                    <Gauge size={28} />
                    <strong>{uptimeLoading ? t('正在读取服务状态') : t('暂无监控数据')}</strong>
                    <span>{t('配置 Uptime Kuma 后，这里会展示服务可用性。')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};

export default Home;
