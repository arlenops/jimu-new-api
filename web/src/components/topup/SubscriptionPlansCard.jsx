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

import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
} from '@douyinfe/semi-ui';
import { API, showError, showSuccess, renderQuota } from '../../helpers';
import { CircleHelp, RefreshCw } from 'lucide-react';
import SubscriptionPurchaseModal from './modals/SubscriptionPurchaseModal';
import {
  formatSubscriptionDuration,
  formatSubscriptionQuotaLabel,
  formatSubscriptionResetPeriod,
} from '../../helpers/subscriptionFormat';

const { Text } = Typography;
const PRICE_SYMBOL = '¥';

const getPlanDurationSeconds = (plan) => {
  const unit = plan?.duration_unit || 'month';
  const value = Number(plan?.duration_value || 1);
  if (unit === 'custom') return Number(plan?.custom_seconds || 0);
  const secondsByUnit = {
    hour: 3600,
    day: 86400,
    month: 30 * 86400,
    year: 365 * 86400,
  };
  return Math.max(0, value * (secondsByUnit[unit] || 0));
};

const getPlanResetSeconds = (plan) => {
  const period = plan?.quota_reset_period || 'never';
  if (period === 'daily') return 86400;
  if (period === 'weekly') return 7 * 86400;
  if (period === 'monthly') return 30 * 86400;
  if (period === 'custom') return Number(plan?.quota_reset_custom_seconds || 0);
  return 0;
};

const getPlanEstimatedTotalQuota = (plan, cycleQuota) => {
  if (!plan || cycleQuota <= 0) return 0;
  const durationSeconds = getPlanDurationSeconds(plan);
  const resetSeconds = getPlanResetSeconds(plan);
  if (durationSeconds <= 0 || resetSeconds <= 0) return 0;
  return cycleQuota * Math.max(1, Math.ceil(durationSeconds / resetSeconds));
};

// 过滤易支付方式
function getEpayMethods(payMethods = []) {
  return (payMethods || []).filter(
    (m) => m?.type && m.type !== 'stripe' && m.type !== 'creem',
  );
}

// 提交易支付表单
function submitEpayForm({ url, params }) {
  const form = document.createElement('form');
  form.action = url;
  form.method = 'POST';
  const isSafari =
    navigator.userAgent.indexOf('Safari') > -1 &&
    navigator.userAgent.indexOf('Chrome') < 1;
  if (!isSafari) form.target = '_blank';
  Object.keys(params || {}).forEach((key) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = params[key];
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

const SubscriptionPlansCard = ({
  t,
  loading = false,
  plans = [],
  payMethods = [],
  enableOnlineTopUp = false,
  enableStripeTopUp = false,
  enableCreemTopUp = false,
  activeSubscriptions = [],
  allSubscriptions = [],
  withCard = true,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paying, setPaying] = useState(false);
  const [selectedEpayMethod, setSelectedEpayMethod] = useState('');

  const epayMethods = useMemo(() => getEpayMethods(payMethods), [payMethods]);

  const openBuy = (p) => {
    setSelectedPlan(p);
    setSelectedEpayMethod(epayMethods?.[0]?.type || '');
    setOpen(true);
  };

  const closeBuy = () => {
    setOpen(false);
    setSelectedPlan(null);
    setPaying(false);
  };

  const payStripe = async () => {
    if (!selectedPlan?.plan?.stripe_price_id) {
      showError(t('该套餐未配置 Stripe'));
      return;
    }
    setPaying(true);
    try {
      const res = await API.post('/api/subscription/stripe/pay', {
        plan_id: selectedPlan.plan.id,
      });
      if (res.data?.message === 'success') {
        window.open(res.data.data?.pay_link, '_blank');
        showSuccess(t('已打开支付页面'));
        closeBuy();
      } else {
        const errorMsg =
          typeof res.data?.data === 'string'
            ? res.data.data
            : res.data?.message || t('支付失败');
        showError(errorMsg);
      }
    } catch (e) {
      showError(t('支付请求失败'));
    } finally {
      setPaying(false);
    }
  };

  const payCreem = async () => {
    if (!selectedPlan?.plan?.creem_product_id) {
      showError(t('该套餐未配置 Creem'));
      return;
    }
    setPaying(true);
    try {
      const res = await API.post('/api/subscription/creem/pay', {
        plan_id: selectedPlan.plan.id,
      });
      if (res.data?.message === 'success') {
        window.open(res.data.data?.checkout_url, '_blank');
        showSuccess(t('已打开支付页面'));
        closeBuy();
      } else {
        const errorMsg =
          typeof res.data?.data === 'string'
            ? res.data.data
            : res.data?.message || t('支付失败');
        showError(errorMsg);
      }
    } catch (e) {
      showError(t('支付请求失败'));
    } finally {
      setPaying(false);
    }
  };

  const payEpay = async () => {
    if (!selectedEpayMethod) {
      showError(t('请选择支付方式'));
      return;
    }
    setPaying(true);
    try {
      const res = await API.post('/api/subscription/epay/pay', {
        plan_id: selectedPlan.plan.id,
        payment_method: selectedEpayMethod,
      });
      if (res.data?.message === 'success') {
        submitEpayForm({ url: res.data.url, params: res.data.data });
        showSuccess(t('已发起支付'));
        closeBuy();
      } else {
        const errorMsg =
          typeof res.data?.data === 'string'
            ? res.data.data
            : res.data?.message || t('支付失败');
        showError(errorMsg);
      }
    } catch (e) {
      showError(t('支付请求失败'));
    } finally {
      setPaying(false);
    }
  };

  // 当前订阅信息 - 支持多个订阅
  const hasActiveSubscription = activeSubscriptions.length > 0;
  const hasAnySubscription = allSubscriptions.length > 0;

  const planPurchaseCountMap = useMemo(() => {
    const map = new Map();
    (allSubscriptions || []).forEach((sub) => {
      const planId = sub?.subscription?.plan_id;
      if (!planId) return;
      map.set(planId, (map.get(planId) || 0) + 1);
    });
    return map;
  }, [allSubscriptions]);

  const planTitleMap = useMemo(() => {
    const map = new Map();
    (plans || []).forEach((p) => {
      const plan = p?.plan;
      if (!plan?.id) return;
      map.set(plan.id, plan.title || '');
    });
    return map;
  }, [plans]);

  const planMap = useMemo(() => {
    const map = new Map();
    (plans || []).forEach((p) => {
      const plan = p?.plan;
      if (!plan?.id) return;
      map.set(plan.id, plan);
    });
    return map;
  }, [plans]);

  const getPlanPurchaseCount = (planId) =>
    planPurchaseCountMap.get(planId) || 0;

  // 计算单个订阅的剩余天数
  const getRemainingDays = (sub) => {
    if (!sub?.subscription?.end_time) return 0;
    const now = Date.now() / 1000;
    const remaining = sub.subscription.end_time - now;
    return Math.max(0, Math.ceil(remaining / 86400));
  };

  // 计算单个订阅的使用进度
  const getUsagePercent = (sub) => {
    const total = Number(sub?.subscription?.amount_total || 0);
    const used = Number(sub?.subscription?.amount_used || 0);
    if (total <= 0) return 0;
    return Math.round((used / total) * 100);
  };

  const cardContent = (
    <>
      {/* 卡片头部 */}
      {loading ? (
        <div className='space-y-4'>
          {/* 我的订阅骨架屏 */}
          <Card className='!rounded-xl w-full' bodyStyle={{ padding: '12px' }}>
            <div className='flex items-center justify-between mb-3'>
              <Skeleton.Title active style={{ width: 100, height: 20 }} />
              <Skeleton.Button active style={{ width: 24, height: 24 }} />
            </div>
            <div className='space-y-2'>
              <Skeleton.Paragraph active rows={2} />
            </div>
          </Card>
          {/* 套餐列表骨架屏 */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 w-full px-1'>
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className='!rounded-xl w-full h-full'
                bodyStyle={{ padding: 16 }}
              >
                <Skeleton.Title
                  active
                  style={{ width: '60%', height: 24, marginBottom: 8 }}
                />
                <Skeleton.Paragraph
                  active
                  rows={1}
                  style={{ marginBottom: 12 }}
                />
                <div className='text-center py-4'>
                  <Skeleton.Title
                    active
                    style={{ width: '40%', height: 32, margin: '0 auto' }}
                  />
                </div>
                <Skeleton.Paragraph active rows={3} style={{ marginTop: 12 }} />
                <Skeleton.Button
                  active
                  block
                  style={{ marginTop: 16, height: 32 }}
                />
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className='flex w-full flex-col gap-2'>
          {/* 当前订阅状态 */}
          <div className='w-full overflow-hidden rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] shadow-[0_18px_36px_-34px_rgba(15,23,42,0.16)]'>
            <div className='p-4'>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
                <div className='min-w-0 flex-1'>
                  <div className='mb-1.5 flex flex-wrap items-center gap-2'>
                    <span className='text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500'>
                      {t('我的订阅')}
                    </span>
                    {hasActiveSubscription ? (
                      <Tag
                        color='white'
                        size='small'
                        shape='circle'
                        prefixIcon={<Badge dot type='success' />}
                      >
                        {activeSubscriptions.length} {t('个生效中')}
                      </Tag>
                    ) : (
                      <Tag color='white' size='small' shape='circle'>
                        {t('无生效')}
                      </Tag>
                    )}
                    {allSubscriptions.length > activeSubscriptions.length && (
                      <Tag color='white' size='small' shape='circle'>
                        {allSubscriptions.length - activeSubscriptions.length}{' '}
                        {t('个已过期')}
                      </Tag>
                    )}
                  </div>
                  <Text className='!text-sm !leading-5 !text-slate-600'>
                    {t(
                      '已购订阅会在有效期内自动提供额度与分组权益，你可以随时切换订阅和钱包的结算优先级。',
                    )}
                  </Text>
                </div>
              </div>

              {hasAnySubscription ? (
                <div className='mt-3 grid max-h-72 gap-2.5 overflow-y-auto pr-1 semi-table-body'>
                  {allSubscriptions.map((sub, subIndex) => {
                    const subscription = sub.subscription;
                    const totalAmount = Number(subscription?.amount_total || 0);
                    const usedAmount = Number(subscription?.amount_used || 0);
                    const remainAmount =
                      totalAmount > 0
                        ? Math.max(0, totalAmount - usedAmount)
                        : 0;
                    const planTitle =
                      planTitleMap.get(subscription?.plan_id) || '';
                    const currentPlan = planMap.get(subscription?.plan_id);
                    const quotaLabel = formatSubscriptionQuotaLabel(
                      currentPlan,
                      t,
                    );
                    const remainDays = getRemainingDays(sub);
                    const usagePercent = getUsagePercent(sub);
                    const now = Date.now() / 1000;
                    const isExpired = (subscription?.end_time || 0) < now;
                    const isCancelled = subscription?.status === 'cancelled';
                    const isActive =
                      subscription?.status === 'active' && !isExpired;

                    return (
                      <div
                        key={subscription?.id || subIndex}
                        className={`relative overflow-hidden rounded-[18px] border px-4 py-2.5 transition-all before:pointer-events-none before:absolute before:right-0 before:top-0 before:h-20 before:w-28 before:rounded-bl-full before:bg-[radial-gradient(circle_at_top_right,rgba(0,178,107,0.12),transparent_68%)] ${
                          isActive
                            ? 'border-[rgba(0,178,107,0.18)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(242,251,246,0.94)_100%)] shadow-[0_16px_34px_-30px_rgba(0,178,107,0.34),inset_0_1px_0_rgba(255,255,255,0.9)]'
                            : 'border-[rgba(15,23,42,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(248,250,252,0.72))]'
                        }`}
                      >
                        <span
                          className={`absolute inset-y-3 left-0 w-1 rounded-r-full shadow-[0_0_14px_rgba(0,178,107,0.24)] ${
                            isActive ? 'bg-[var(--va-accent)]' : 'bg-slate-300'
                          }`}
                        />
                        <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_132px_minmax(240px,380px)] md:items-center'>
                          <div className='min-w-0'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <span className='truncate text-sm font-semibold text-slate-900'>
                                {planTitle
                                  ? `${planTitle} · ${t('订阅')} #${subscription?.id}`
                                  : `${t('订阅')} #${subscription?.id}`}
                              </span>
                              {isActive ? (
                                <Tag
                                  color='white'
                                  size='small'
                                  shape='circle'
                                  prefixIcon={<Badge dot type='success' />}
                                >
                                  {t('生效')}
                                </Tag>
                              ) : isCancelled ? (
                                <Tag color='white' size='small' shape='circle'>
                                  {t('已作废')}
                                </Tag>
                              ) : (
                                <Tag color='white' size='small' shape='circle'>
                                  {t('已过期')}
                                </Tag>
                              )}
                            </div>

                            <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs leading-5 text-slate-500'>
                              <span>
                                {isActive
                                  ? t('至')
                                  : isCancelled
                                    ? t('作废于')
                                    : t('过期于')}{' '}
                                {new Date(
                                  (subscription?.end_time || 0) * 1000,
                                ).toLocaleString()}
                              </span>
                              {isActive &&
                                subscription?.next_reset_time > 0 && (
                                  <span>
                                    {t('下次重置')}:{' '}
                                    {new Date(
                                      subscription.next_reset_time * 1000,
                                    ).toLocaleString()}
                                  </span>
                                )}
                            </div>
                          </div>

                          <div className='relative rounded-2xl border border-[rgba(0,178,107,0.12)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(239,250,244,0.76))] px-3 py-2 text-left shadow-[0_10px_22px_-24px_rgba(0,178,107,0.42),inset_0_1px_0_rgba(255,255,255,0.9)] md:text-right'>
                            <div className='text-[11px] font-semibold tracking-wide text-[var(--va-accent)]/75'>
                              {t('剩余额度')}
                            </div>
                            <div className='mt-0.5 truncate text-base font-bold leading-none text-slate-950'>
                              {totalAmount > 0
                                ? renderQuota(remainAmount)
                                : t('不限')}
                            </div>
                          </div>

                          {totalAmount > 0 && (
                            <div className='min-w-0 rounded-2xl border border-[rgba(0,178,107,0.1)] bg-[linear-gradient(135deg,rgba(247,252,249,0.92),rgba(255,255,255,0.72))] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]'>
                              <div className='mb-1 flex items-center justify-between gap-2 text-xs leading-5'>
                                <span className='shrink-0 font-semibold text-slate-700'>
                                  {quotaLabel}
                                </span>
                                <Tooltip
                                  content={`${t('原生额度')}：${usedAmount}/${totalAmount} · ${t('剩余')} ${remainAmount}`}
                                >
                                  <span className='truncate text-right text-slate-500'>
                                    <span className='font-medium text-slate-800'>
                                      {renderQuota(usedAmount)}
                                    </span>
                                    <span className='text-slate-400'>
                                      /{renderQuota(totalAmount)}
                                    </span>
                                    <span className='ml-2 text-slate-500'>
                                      {t('剩余')} {renderQuota(remainAmount)}
                                    </span>
                                  </span>
                                </Tooltip>
                              </div>
                              <div className='h-1.5 overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)]'>
                                <div
                                  className={`h-full rounded-full ${
                                    isActive
                                      ? 'bg-[linear-gradient(90deg,var(--va-accent),rgba(0,178,107,0.72))]'
                                      : 'bg-slate-400'
                                  }`}
                                  style={{
                                    width: `${Math.min(usagePercent, 100)}%`,
                                  }}
                                />
                              </div>
                              <div className='mt-0.5 flex flex-wrap justify-between gap-2 text-[11px] text-slate-400'>
                                <span>
                                  {t('已用')} {usagePercent}%
                                </span>
                                {isActive && (
                                  <span>
                                    {t('剩余')} {remainDays} {t('天')}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='mt-3 rounded-[18px] border border-dashed border-slate-200 bg-white/65 px-4 py-4 text-sm text-slate-500'>
                  {t('购买套餐后即可享受模型权益')}
                </div>
              )}
            </div>
          </div>

          {/* 可购买套餐 - 标准定价卡片 */}
          {plans.length > 0 ? (
            <div className='grid w-full content-start items-start justify-items-stretch gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
              {plans.map((p, index) => {
                const plan = p?.plan;
                const totalAmount = Number(plan?.total_amount || 0);
                const price = Number(plan?.price_amount || 0);
                const displayPrice = price.toFixed(
                  Number.isInteger(price) ? 0 : 2,
                );
                const isPopular = index === 0 && plans.length > 1;
                const limit = Number(plan?.max_purchase_per_user || 0);
                const limitLabel = limit > 0 ? `${t('限购')} ${limit}` : null;
                const resetPeriodText = formatSubscriptionResetPeriod(plan, t);
                const hasQuotaReset = resetPeriodText !== t('不重置');
                const totalLabel =
                  totalAmount > 0
                    ? `${formatSubscriptionQuotaLabel(plan, t)}: ${renderQuota(totalAmount)}`
                    : `${formatSubscriptionQuotaLabel(plan, t)}: ${t('不限')}`;
                const resetBadgeText = hasQuotaReset
                  ? `${resetPeriodText}${t('重置')}`
                  : t('不重置');
                const estimatedTotalQuota = hasQuotaReset
                  ? getPlanEstimatedTotalQuota(plan, totalAmount)
                  : 0;
                const upgradeLabel = plan?.upgrade_group
                  ? `${t('升级分组')}: ${plan.upgrade_group}`
                  : null;
                const planBenefits = [
                  {
                    label: `${t('有效期')}: ${formatSubscriptionDuration(plan, t)}`,
                  },
                  totalAmount > 0
                    ? {
                        label: totalLabel,
                        content: (
                          <div className='flex flex-wrap items-center gap-2'>
                            <span>{totalLabel}</span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 ${
                                hasQuotaReset
                                  ? 'border-[rgba(0,178,107,0.16)] bg-[rgba(0,178,107,0.08)] text-[var(--va-accent)]'
                                  : 'border-[rgba(15,23,42,0.08)] bg-[rgba(247,250,245,0.9)] text-slate-500'
                              }`}
                            >
                              <RefreshCw size={10} />
                              {resetBadgeText}
                            </span>
                          </div>
                        ),
                        tooltip: `${t('原生额度')}：${totalAmount}`,
                        emphasized: true,
                      }
                    : {
                        label: totalLabel,
                        content: (
                          <div className='flex flex-wrap items-center gap-2'>
                            <span>{totalLabel}</span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 ${
                                hasQuotaReset
                                  ? 'border-[rgba(0,178,107,0.16)] bg-[rgba(0,178,107,0.08)] text-[var(--va-accent)]'
                                  : 'border-[rgba(15,23,42,0.08)] bg-[rgba(247,250,245,0.9)] text-slate-500'
                              }`}
                            >
                              <RefreshCw size={10} />
                              {resetBadgeText}
                            </span>
                          </div>
                        ),
                        emphasized: true,
                      },
                  estimatedTotalQuota > totalAmount
                    ? {
                        label: `${t('预计可用总额度')}: ${renderQuota(estimatedTotalQuota)}`,
                        content: (
                          <div className='flex flex-wrap items-center gap-1.5'>
                            <span>
                              {t('预计可用总额度')}:{' '}
                              {renderQuota(estimatedTotalQuota)}
                            </span>
                            <Tooltip
                              content={`${t('按套餐有效期内每个周期额度都用完计算')}，${formatSubscriptionQuotaLabel(plan, t)} ${renderQuota(totalAmount)} × ${Math.ceil(estimatedTotalQuota / totalAmount)} ${t('个周期')}`}
                            >
                              <CircleHelp
                                size={13}
                                className='shrink-0 text-slate-400'
                              />
                            </Tooltip>
                          </div>
                        ),
                      }
                    : null,
                  limitLabel ? { label: limitLabel } : null,
                  upgradeLabel ? { label: upgradeLabel } : null,
                ].filter(Boolean);

                return (
                  <div
                    key={plan?.id}
                    className={`flex w-full h-full flex-col rounded-[16px] border px-3.5 py-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_24px_-24px_rgba(15,23,42,0.18)] ${
                      isPopular
                        ? 'border-[rgba(0,178,107,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(244,250,245,0.94)_100%)] shadow-[0_18px_32px_-30px_rgba(0,178,107,0.16)]'
                        : 'border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.9)] shadow-[0_16px_28px_-30px_rgba(15,23,42,0.16)]'
                    }`}
                  >
                    <div className='flex h-full flex-col'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <div className='mb-1.5 flex flex-wrap items-center gap-1.5'>
                            {isPopular ? (
                              <Tag color='green' shape='circle' size='small'>
                                {t('推荐')}
                              </Tag>
                            ) : (
                              <Tag color='white' shape='circle' size='small'>
                                {t('订阅计划')}
                              </Tag>
                            )}
                            {limitLabel && (
                              <Tag color='white' shape='circle' size='small'>
                                {limitLabel}
                              </Tag>
                            )}
                          </div>

                          <Typography.Title
                            heading={6}
                            ellipsis={{ rows: 1, showTooltip: true }}
                            style={{ margin: 0 }}
                            className='!text-[17px] !font-semibold !tracking-tight !text-slate-900'
                          >
                            {plan?.title || t('订阅套餐')}
                          </Typography.Title>

                          {plan?.subtitle && (
                            <Text
                              size='small'
                              ellipsis={{ rows: 2, showTooltip: true }}
                              className='!mt-1 !block !leading-4 !text-slate-500'
                            >
                              {plan.subtitle}
                            </Text>
                          )}
                        </div>
                      </div>

                      <div className='mt-3 flex items-baseline gap-1.5'>
                        <span className='text-sm font-semibold text-[var(--va-accent)]'>
                          {PRICE_SYMBOL}
                        </span>
                        <span className='text-[26px] font-semibold tracking-tight text-slate-950'>
                          {displayPrice}
                        </span>
                        <span className='text-xs text-slate-500'>
                          {t('一次性购买')}
                        </span>
                      </div>

                      <div className='mt-0.5 text-[11px] leading-4 text-slate-500'>
                        {t('权益在有效期内立即生效')}
                      </div>

                      <div className='mt-3 space-y-1.5 border-t border-[rgba(15,23,42,0.08)] pt-2.5'>
                        {planBenefits.map((item) => {
                          const content = (
                            <div
                              className={`flex items-start gap-1.5 text-[12px] leading-5 ${
                                item.emphasized
                                  ? 'font-medium text-slate-800'
                                  : 'text-slate-600'
                              }`}
                            >
                              <span
                                className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
                                  item.emphasized || isPopular
                                    ? 'bg-[var(--va-accent)]'
                                    : 'bg-slate-300'
                                }`}
                              />
                              <span>{item.content || item.label}</span>
                            </div>
                          );
                          if (!item.tooltip) {
                            return <div key={item.label}>{content}</div>;
                          }
                          return (
                            <Tooltip key={item.label} content={item.tooltip}>
                              {content}
                            </Tooltip>
                          );
                        })}
                      </div>

                      <div className='mt-auto pt-3'>
                        {(() => {
                          const count = getPlanPurchaseCount(p?.plan?.id);
                          const reached = limit > 0 && count >= limit;
                          const tip = reached
                            ? t('已达到购买上限') + ` (${count}/${limit})`
                            : '';
                          const buttonEl = (
                            <Button
                              theme='solid'
                              type='primary'
                              block
                              className='!h-8 !rounded-lg !text-sm active:translate-y-[1px]'
                              disabled={reached}
                              onClick={() => {
                                if (!reached) openBuy(p);
                              }}
                            >
                              {reached ? t('已达上限') : t('立即订阅')}
                            </Button>
                          );
                          return reached ? (
                            <Tooltip content={tip} position='top'>
                              {buttonEl}
                            </Tooltip>
                          ) : (
                            buttonEl
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='text-center text-gray-400 text-sm py-4'>
              {t('暂无可购买套餐')}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      {withCard ? (
        <Card className='!rounded-[24px] w-full border-0 shadow-[0_22px_46px_-38px_rgba(15,23,42,0.18)]'>
          {cardContent}
        </Card>
      ) : (
        <div className='w-full space-y-3'>{cardContent}</div>
      )}

      {/* 购买确认弹窗 */}
      <SubscriptionPurchaseModal
        t={t}
        visible={open}
        onCancel={closeBuy}
        selectedPlan={selectedPlan}
        paying={paying}
        selectedEpayMethod={selectedEpayMethod}
        setSelectedEpayMethod={setSelectedEpayMethod}
        epayMethods={epayMethods}
        enableOnlineTopUp={enableOnlineTopUp}
        enableStripeTopUp={enableStripeTopUp}
        enableCreemTopUp={enableCreemTopUp}
        purchaseLimitInfo={
          selectedPlan?.plan?.id
            ? {
                limit: Number(selectedPlan?.plan?.max_purchase_per_user || 0),
                count: getPlanPurchaseCount(selectedPlan?.plan?.id),
              }
            : null
        }
        onPayStripe={payStripe}
        onPayCreem={payCreem}
        onPayEpay={payEpay}
      />
    </>
  );
};

export default SubscriptionPlansCard;
