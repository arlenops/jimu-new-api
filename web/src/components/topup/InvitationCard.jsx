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

import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Typography,
  Card,
  Button,
  Input,
  Badge,
  Space,
  Table,
  Empty,
  Tag,
} from '@douyinfe/semi-ui';
import {
  Copy,
  Users,
  BarChart2,
  TrendingUp,
  Gift,
  Zap,
} from 'lucide-react';
import { IconSearch } from '@douyinfe/semi-icons';
import {
  API,
  showError,
  timestamp2string,
} from '../../helpers';
import {
  formatUsdAmount,
  quotaToUsdAmount,
} from '../../helpers/quota';

const { Text } = Typography;

const emptyOverview = {
  registered_invitee_count: 0,
  consumed_invitee_count: 0,
  total_consumed_quota: 0,
  total_consumed_amount_usd: 0,
  total_commission_quota: 0,
  commission_rate: 0,
  invitee_bonus_quota: 0,
};

const InvitationCard = ({
  standalone = false,
  t,
  userState,
  renderQuota,
  setOpenTransfer,
  affLink,
  handleAffLinkClick,
}) => {
  const [overview, setOverview] = useState(emptyOverview);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [invitees, setInvitees] = useState([]);
  const [inviteesLoading, setInviteesLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const handlePromotionApiError = (error, fallbackMessage, fallback) => {
    const status = error?.response?.status;

    if (status === 401) {
      showError(error);
      return;
    }

    if (status === 404) {
      fallback?.();
      return;
    }

    fallback?.();
    showError(fallbackMessage);
  };

  const summaryCoverStyle = standalone
    ? {
        background:
          'radial-gradient(circle at 18% 18%, rgba(0,178,107,0.16), transparent 24%), radial-gradient(circle at 82% 24%, rgba(48,108,206,0.12), transparent 30%), linear-gradient(135deg, rgba(244,250,245,0.98) 0%, rgba(236,244,239,0.96) 100%)',
      }
    : {
        '--palette-primary-darkerChannel': '0 75 80',
        backgroundImage:
          "linear-gradient(0deg, rgba(var(--palette-primary-darkerChannel) / 80%), rgba(var(--palette-primary-darkerChannel) / 80%)), url('/cover-4.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
  const standaloneTitleColor = standalone ? 'var(--va-text)' : 'white';
  const standaloneMetaColor = standalone
    ? 'var(--va-text-muted)'
    : 'rgba(255,255,255,0.8)';

  const loadOverview = async () => {
    setOverviewLoading(true);
    try {
      const res = await API.get('/api/user/promotion/overview', {
        skipErrorHandler: true,
      });
      const { success, message, data } = res.data;
      if (success) {
        setOverview({
          ...emptyOverview,
          ...(data || {}),
        });
      } else {
        showError(message || t('加载推广概览失败'));
      }
    } catch (error) {
      handlePromotionApiError(error, t('加载推广概览失败'), () => {
        setOverview(emptyOverview);
      });
    } finally {
      setOverviewLoading(false);
    }
  };

  const loadInvitees = async (currentPage, currentPageSize, currentKeyword) => {
    setInviteesLoading(true);
    try {
      const query =
        `p=${currentPage}&page_size=${currentPageSize}` +
        (currentKeyword
          ? `&keyword=${encodeURIComponent(currentKeyword)}`
          : '');
      const res = await API.get(`/api/user/promotion/invitees?${query}`, {
        skipErrorHandler: true,
      });
      const { success, message, data } = res.data;
      if (success) {
        setInvitees(data?.items || []);
        setTotal(data?.total || 0);
      } else {
        showError(message || t('加载推广明细失败'));
      }
    } catch (error) {
      handlePromotionApiError(error, t('加载推广明细失败'), () => {
        setInvitees([]);
        setTotal(0);
      });
    } finally {
      setInviteesLoading(false);
    }
  };

  useEffect(() => {
    loadOverview().then();
  }, []);

  useEffect(() => {
    loadInvitees(page, pageSize, keyword).then();
  }, [page, pageSize, keyword]);

  const columns = useMemo(
    () => [
      {
        title: t('推广用户'),
        dataIndex: 'username',
        key: 'username',
        render: (_, record) => (
          <div className='min-w-0'>
            <div className='font-medium text-[var(--va-text,#101828)]'>
              {record.display_name || record.username || '-'}
            </div>
            <div className='text-xs text-[var(--va-text-muted,#6b7280)]'>
              @{record.username || '-'}
            </div>
          </div>
        ),
      },
      {
        title: t('邮箱'),
        dataIndex: 'email',
        key: 'email',
        render: (value) => value || '-',
      },
      {
        title: t('充值次数'),
        dataIndex: 'reward_count',
        key: 'reward_count',
        render: (value) => value || 0,
      },
      {
        title: t('累计充值金额'),
        dataIndex: 'total_consumed_quota',
        key: 'total_consumed_quota',
        render: (_, record) =>
          formatUsdAmount(quotaToUsdAmount(record.total_consumed_quota || 0)),
      },
      {
        title: t('累计奖励'),
        dataIndex: 'total_reward_quota',
        key: 'total_reward_quota',
        render: (value) => formatUsdAmount(quotaToUsdAmount(value || 0)),
      },
      {
        title: t('首次充值'),
        dataIndex: 'first_consume_time',
        key: 'first_consume_time',
        render: (value) => (value ? timestamp2string(value) : '-'),
      },
      {
        title: t('最近充值'),
        dataIndex: 'last_consume_time',
        key: 'last_consume_time',
        render: (value) => (value ? timestamp2string(value) : '-'),
      },
    ],
    [t],
  );

  return (
    <Card
      className={`!rounded-2xl shadow-sm border-0 ${standalone ? 'va-wallet-surface-card' : ''}`}
    >
      <div className='mb-4 flex items-center'>
        <Avatar size='small' color='green' className='mr-3 shadow-md'>
          <Gift size={16} />
        </Avatar>
        <div>
          <Typography.Text className='text-lg font-medium'>
            {t('推广中心')}
          </Typography.Text>
          <div className='text-xs'>{t('邀请用户充值后按比例返佣')}</div>
        </div>
      </div>

      <Space vertical style={{ width: '100%' }} spacing='medium'>
        <Card
          className={`!rounded-xl w-full va-promotion-summary-card ${standalone ? 'va-wallet-feature-card' : ''}`}
          cover={
            <div className='relative min-h-[148px]' style={summaryCoverStyle}>
              <div className='relative z-10 h-full flex flex-col justify-between p-3 md:p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <Text
                    strong
                    style={{ color: standaloneTitleColor, fontSize: '16px' }}
                  >
                    {t('收益统计')}
                  </Text>
                  <Button
                    type='primary'
                    theme='solid'
                    size='small'
                    disabled={
                      !userState?.user?.aff_quota ||
                      userState?.user?.aff_quota <= 0
                    }
                    onClick={() => setOpenTransfer(true)}
                    className='!rounded-lg'
                  >
                    <Zap size={12} className='mr-1' />
                    {t('划转到余额')}
                  </Button>
                </div>

                <div className='mt-3 grid grid-cols-3 gap-3'>
                  <div className='text-center'>
                    <div
                      className='mb-1 text-base font-bold sm:text-2xl'
                      style={{ color: standaloneTitleColor }}
                    >
                      {formatUsdAmount(
                        quotaToUsdAmount(userState?.user?.aff_quota || 0),
                      )}
                    </div>
                    <div className='flex items-center justify-center text-sm'>
                      <TrendingUp
                        size={14}
                        className='mr-1'
                        style={{ color: standaloneMetaColor }}
                      />
                      <Text
                        style={{
                          color: standaloneMetaColor,
                          fontSize: '12px',
                        }}
                      >
                        {t('待划转奖励')}
                      </Text>
                    </div>
                  </div>

                  <div className='text-center'>
                    <div
                      className='mb-1 text-base font-bold sm:text-2xl'
                      style={{ color: standaloneTitleColor }}
                    >
                      {formatUsdAmount(
                        quotaToUsdAmount(userState?.user?.aff_history_quota || 0),
                      )}
                    </div>
                    <div className='flex items-center justify-center text-sm'>
                      <BarChart2
                        size={14}
                        className='mr-1'
                        style={{ color: standaloneMetaColor }}
                      />
                      <Text
                        style={{
                          color: standaloneMetaColor,
                          fontSize: '12px',
                        }}
                      >
                        {t('累计奖励')}
                      </Text>
                    </div>
                  </div>

                  <div className='text-center'>
                    <div
                      className='mb-1 text-base font-bold sm:text-2xl'
                      style={{ color: standaloneTitleColor }}
                    >
                      {userState?.user?.aff_count || 0}
                    </div>
                    <div className='flex items-center justify-center text-sm'>
                      <Users
                        size={14}
                        className='mr-1'
                        style={{ color: standaloneMetaColor }}
                      />
                      <Text
                        style={{
                          color: standaloneMetaColor,
                          fontSize: '12px',
                        }}
                      >
                        {t('邀请注册人数')}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className='mt-3 flex flex-wrap gap-2'>
                  <Tag color='green' shape='circle'>
                    {t('当前提成')} {overview.commission_rate || 0}%
                  </Tag>
                  <Tag color='blue' shape='circle'>
                    {t('已充值用户')} {overview.consumed_invitee_count || 0}
                  </Tag>
                  <Tag color='teal' shape='circle'>
                    {t('累计充值')}{' '}
                    {formatUsdAmount(
                      quotaToUsdAmount(overview.total_consumed_quota || 0),
                    )}
                  </Tag>
                </div>
              </div>
            </div>
          }
        >
          <div className='space-y-4'>
            <Input
              value={affLink}
              readOnly
              className='!rounded-lg'
              prefix={t('邀请链接')}
              suffix={
                <Button
                  type='primary'
                  theme='solid'
                  onClick={handleAffLinkClick}
                  icon={<Copy size={14} />}
                  className='!rounded-lg'
                >
                  {t('复制')}
                </Button>
              }
            />

            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='va-promotion-mini-stat rounded-xl border px-4 py-3'>
                <div className='mb-1 text-xs text-[var(--va-text-muted,#6b7280)]'>
                  {t('充值返佣比例')}
                </div>
                <div className='text-lg font-semibold text-[var(--va-text,#101828)]'>
                  {overview.commission_rate || 0}%
                </div>
              </div>

              <div className='va-promotion-mini-stat rounded-xl border px-4 py-3'>
                <div className='mb-1 text-xs text-[var(--va-text-muted,#6b7280)]'>
                  {t('累计充值金额')}
                </div>
                <div className='text-lg font-semibold text-[var(--va-text,#101828)]'>
                  {formatUsdAmount(
                    quotaToUsdAmount(overview.total_consumed_quota || 0),
                  )}
                </div>
              </div>

              <div className='va-promotion-mini-stat rounded-xl border px-4 py-3'>
                <div className='mb-1 text-xs text-[var(--va-text-muted,#6b7280)]'>
                  {t('邀请码新用户奖励')}
                </div>
                <div className='text-lg font-semibold text-[var(--va-text,#101828)]'>
                  {formatUsdAmount(
                    quotaToUsdAmount(overview.invitee_bonus_quota || 0),
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card
          className={`!rounded-xl w-full ${standalone ? 'va-wallet-surface-card va-promotion-table-card' : ''}`}
          title={<Text type='tertiary'>{t('推广充值明细')}</Text>}
        >
          <div className='mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <Input
              prefix={<IconSearch />}
              placeholder={t('搜索用户名或邮箱')}
              value={keyword}
              onChange={(value) => {
                setKeyword(value);
                setPage(1);
              }}
              showClear
            />

            <div className='flex flex-wrap gap-2 text-sm text-[var(--va-text-muted,#6b7280)]'>
              <span>
                {t('已充值用户')}：{overview.consumed_invitee_count || 0}
              </span>
              <span>
                {t('累计充值')}：
                {formatUsdAmount(
                  quotaToUsdAmount(overview.total_consumed_quota || 0),
                )}
              </span>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={invitees}
            loading={inviteesLoading || overviewLoading}
            rowKey='invitee_id'
            pagination={{
              currentPage: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOpts: [10, 20, 50],
              onPageChange: (currentPage) => setPage(currentPage),
              onPageSizeChange: (currentPageSize) => {
                setPageSize(currentPageSize);
                setPage(1);
              },
            }}
            empty={
              <Empty
                description={t('暂无推广充值记录')}
                style={{ padding: 24 }}
              />
            }
            size='small'
          />

          <div className='mt-4 space-y-2'>
            <div className='va-promotion-note-row flex items-start gap-2'>
              <Badge dot type='success' />
              <Text type='tertiary' className='text-sm'>
                {t('邀请用户完成充值后，系统按设置比例累积返佣到推广奖励')}
              </Text>
            </div>

            <div className='va-promotion-note-row flex items-start gap-2'>
              <Badge dot type='success' />
              <Text type='tertiary' className='text-sm'>
                {t('推广奖励仍需通过划转功能转入账户余额后才能继续使用')}
              </Text>
            </div>

            <div className='va-promotion-note-row flex items-start gap-2'>
              <Badge dot type='success' />
              <Text type='tertiary' className='text-sm'>
                {t('新用户使用邀请码奖励额度功能仍然保留，可用于后续邀请活动')}
              </Text>
            </div>
          </div>
        </Card>
      </Space>
    </Card>
  );
};

export default InvitationCard;
