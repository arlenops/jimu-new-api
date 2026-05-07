import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, Space, Tag, Typography } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import CardPro from '../../common/ui/CardPro';
import CardTable from '../../common/ui/CardTable';
import { API, showError, timestamp2string } from '../../../helpers';
import { createCardProPagination } from '../../../helpers/utils';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../../hooks/common/useIsMobile';
import TopActivityBannerSettings from './TopActivityBannerSettings';

const { Text } = Typography;

const formatCnyAmount = (amount) => {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return '¥0';
  return `¥${value.toFixed(2)}`;
};

const formatUsdAmount = (amount) => {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return '$0';
  return `$${value.toFixed(2)}`;
};

const renderDualAmount = (cnyAmount, usdAmount) => (
  <div className='flex min-w-[132px] flex-col'>
    <Text strong>{formatCnyAmount(cnyAmount)}</Text>
    <Text type='tertiary' size='small'>
      {formatUsdAmount(usdAmount)}
    </Text>
  </div>
);

const renderUserCell = (name, username, email) => (
  <div className='min-w-[180px]'>
    <div className='font-medium text-[var(--semi-color-text-0)]'>
      {name || username || '-'}
    </div>
    <div className='text-xs text-[var(--semi-color-text-2)]'>
      @{username || '-'}
    </div>
    <div className='text-xs text-[var(--semi-color-text-2)]'>{email || '-'}</div>
  </div>
);

const PromotionRewardsPage = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const loadRecords = async (page = activePage, size = pageSize, kw = keyword) => {
    setLoading(true);
    try {
      const query =
        `p=${page}&page_size=${size}` +
        (kw ? `&keyword=${encodeURIComponent(kw)}` : '');
      const res = await API.get(`/api/user/promotion/rewards?${query}`);
      const { success, message, data } = res.data;
      if (success) {
        setRecords(data?.items || []);
        setTotal(data?.total || 0);
      } else {
        showError(message || t('加载返利流水失败'));
      }
    } catch (error) {
      showError(error.message || t('加载返利流水失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords(activePage, pageSize, keyword).then();
  }, [activePage, pageSize, keyword]);

  const columns = useMemo(
    () => [
      {
        title: t('时间'),
        dataIndex: 'created_at',
        key: 'created_at',
        render: (value) => timestamp2string(value),
      },
      {
        title: t('充值用户'),
        key: 'invitee',
        render: (_, record) =>
          renderUserCell(
            record.invitee_display_name,
            record.invitee_username,
            record.invitee_email,
          ),
      },
      {
        title: t('获利用户'),
        key: 'inviter',
        render: (_, record) =>
          renderUserCell(
            record.inviter_display_name,
            record.inviter_username,
            record.inviter_email,
          ),
      },
      {
        title: t('充值金额'),
        key: 'paid_amount',
        render: (_, record) =>
          renderDualAmount(record.paid_amount, record.credit_amount_usd),
      },
      {
        title: t('返利金额'),
        key: 'reward_amount',
        render: (_, record) =>
          renderDualAmount(record.reward_amount, record.reward_amount_usd),
      },
      {
        title: t('返利比例'),
        dataIndex: 'reward_rate',
        key: 'reward_rate',
        render: (value) => (
          <Tag color='green' shape='circle'>
            {value || 0}%
          </Tag>
        ),
      },
      {
        title: t('订单标识'),
        dataIndex: 'source_request_id',
        key: 'source_request_id',
        render: (value) => value || '-',
      },
    ],
    [t],
  );

  return (
    <>
      <CardPro
        type='type2'
        statsArea={
          <div className='flex flex-wrap items-center gap-2'>
            <Tag color='teal' shape='circle'>
              {t('返利流水按历史订单实际价格计算')}
            </Tag>
            <Tag color='blue' shape='circle'>
              {t('人民币按历史实付金额展示')}
            </Tag>
            <Tag color='green' shape='circle'>
              {t('美元按历史到账额度展示')}
            </Tag>
          </div>
        }
        searchArea={
          <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            <div className='w-full md:max-w-sm'>
              <Input
                prefix={<IconSearch />}
                placeholder={t('搜索充值用户、获利用户或订单号')}
                value={keyword}
                onChange={(value) => {
                  setKeyword(value);
                  setActivePage(1);
                }}
                showClear
              />
            </div>

            <Space>
              <Button
                type='tertiary'
                onClick={() => loadRecords(1, pageSize, keyword)}
                loading={loading}
              >
                {t('查询')}
              </Button>
              <Button
                type='tertiary'
                onClick={() => {
                  setKeyword('');
                  setActivePage(1);
                }}
              >
                {t('重置')}
              </Button>
            </Space>
          </div>
        }
        paginationArea={createCardProPagination({
          currentPage: activePage,
          pageSize,
          total,
          onPageChange: setActivePage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setActivePage(1);
          },
          isMobile,
          t,
        })}
        t={t}
      >
        <CardTable
          columns={columns}
          dataSource={records}
          rowKey='id'
          loading={loading}
          scroll={undefined}
          hidePagination={true}
          className='w-full overflow-hidden'
          style={{ width: '100%' }}
          empty={
            <Empty
              image={
                <IllustrationNoResult style={{ width: 150, height: 150 }} />
              }
              darkModeImage={
                <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
              }
              description={t('暂无返利流水')}
              style={{ padding: 30 }}
            />
          }
        />
      </CardPro>
      <TopActivityBannerSettings />
    </>
  );
};

export default PromotionRewardsPage;
