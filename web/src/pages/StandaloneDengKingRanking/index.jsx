import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@douyinfe/semi-ui';
import {
  Crown,
  Medal,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import StandalonePageShell from '../../components/common/layout/StandalonePageShell';
import {
  API,
  renderQuota,
  showError,
  timestamp2string,
} from '../../helpers';

const rankIcons = [Crown, Trophy, Medal];
const rankColors = ['#f59e0b', '#64748b', '#b45309'];
const defaultRankColor = '#94a3b8';

const maskUsername = (username, t) => {
  if (!username) {
    return t('匿名用户');
  }

  const chars = Array.from(username);
  const visibleCount =
    chars.length <= 1 ? 1 : Math.ceil(chars.length / 2);

  return `${chars.slice(0, visibleCount).join('')}${'*'.repeat(
    Math.max(0, chars.length - visibleCount),
  )}`;
};

const getDisplayName = (item, t) => maskUsername(item?.username, t);

const StandaloneDengKingRanking = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({
    start_timestamp: 0,
    end_timestamp: 0,
  });

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/log/daily_consume_leaderboard');
      const { success, message, data } = res.data;
      if (!success) {
        showError(message || t('加载蹬王排行失败'));
        return;
      }
      setItems(data?.items || []);
      setMeta({
        start_timestamp: data?.start_timestamp || 0,
        end_timestamp: data?.end_timestamp || 0,
      });
    } catch (error) {
      showError(error?.message || t('加载蹬王排行失败'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadLeaderboard().then();
  }, [loadLeaderboard]);

  const leaderboardItems = useMemo(() => {
    const rankedItems = items.slice(0, 10);
    const maxQuota = Math.max(
      ...rankedItems.map((item) => Number(item.total_quota || 0)),
      1,
    );

    return rankedItems.map((item, index) => ({
      ...item,
      displayRank: index + 1,
      icon: rankIcons[index] || null,
      color: rankColors[index] || defaultRankColor,
      displayHeight: Math.max(
        132,
        Math.round((Number(item.total_quota || 0) / maxQuota) * 320),
      ),
    }));
  }, [items]);

  return (
    <StandalonePageShell
      showHero={false}
      contentWidthClass='max-w-[1660px]'
      eyebrow={t('Daily Burn Board')}
      title={t('蹬王排行')}
      description={t(
        '按今日消费额度实时统计前十名用户，方便快速查看当天消耗最猛的账号。',
      )}
      badge={`${t('Top 10')} · ${t('当日消耗')}`}
    >
      <div className='flex flex-col gap-5'>
        <section className='px-1'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <div className='text-sm font-semibold text-[var(--va-text,#101828)]'>
                {t('今日蹬王')}
              </div>
              <div className='mt-1 text-xs text-[var(--va-text-muted,#6b7280)]'>
                {meta.end_timestamp
                  ? `${t('更新时间')} · ${timestamp2string(meta.end_timestamp)}`
                  : t('等待数据加载')}
              </div>
            </div>
            <Button
              theme='outline'
              type='tertiary'
              icon={<RefreshCw size={14} />}
              onClick={loadLeaderboard}
              loading={loading}
            >
              {t('刷新')}
            </Button>
          </div>

          <div className='mt-6 overflow-x-auto pb-2 scrollbar-hide'>
            <div className='flex min-w-full justify-center'>
              <div
                className='relative w-full min-w-[1460px] rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] px-8 pb-8 pt-10 shadow-[0_18px_40px_rgba(15,23,42,0.06)]'
              >
                <div className='pointer-events-none absolute inset-x-8 top-10 bottom-[86px]'>
                  <div className='absolute inset-x-0 bottom-[25%] border-t border-dashed border-[rgba(15,23,42,0.08)]' />
                  <div className='absolute inset-x-0 bottom-[50%] border-t border-dashed border-[rgba(15,23,42,0.08)]' />
                  <div className='absolute inset-x-0 bottom-[75%] border-t border-dashed border-[rgba(15,23,42,0.08)]' />
                </div>

                <div className='relative flex min-h-[500px] items-end justify-center gap-5'>
                  {leaderboardItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.user_id}
                        className='flex w-[122px] shrink-0 flex-col items-center justify-end gap-4'
                      >
                        <div className='text-center'>
                          <div
                            className='text-[28px] font-semibold tracking-[-0.04em]'
                            style={{
                              color:
                                item.displayRank === 1 ? 'var(--va-accent)' : item.color,
                            }}
                          >
                            {renderQuota(item.total_quota || 0)}
                          </div>
                          <div className='mt-1 text-[11px] text-[var(--va-text-muted,#6b7280)]'>
                            {t('请求')} {Number(item.request_count || 0).toLocaleString()}
                          </div>
                        </div>

                        <div
                          className='relative flex w-full items-end justify-center rounded-t-[20px] border border-b-0 shadow-[0_22px_40px_rgba(15,23,42,0.1)]'
                          style={{
                            height: `${item.displayHeight}px`,
                            background:
                              item.displayRank === 1
                                ? 'linear-gradient(180deg, #24c76f 0%, #13a861 100%)'
                                : `linear-gradient(180deg, ${item.color} 0%, ${item.color}CC 100%)`,
                            borderColor:
                              item.displayRank === 1
                                ? 'rgba(19, 168, 97, 0.28)'
                                : `${item.color}55`,
                          }}
                        >
                          <div className='absolute -top-3 flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.72)] bg-[rgba(255,255,255,0.9)] px-2 py-1 shadow-[0_10px_24px_rgba(15,23,42,0.08)]'>
                            {Icon ? (
                              <span style={{ color: item.color }}>
                                <Icon size={13} />
                              </span>
                            ) : null}
                            <span
                              className='text-[11px] font-semibold'
                              style={{ color: item.color }}
                            >
                              #{item.displayRank}
                            </span>
                          </div>

                          <div className='pb-5 text-[42px] font-semibold tracking-[-0.05em] text-white/95'>
                            {item.displayRank}
                          </div>
                        </div>

                        <div className='w-full border-t border-[rgba(15,23,42,0.08)] pt-4 text-center'>
                          <div className='truncate text-base font-semibold text-[var(--va-text,#101828)]'>
                            {getDisplayName(item, t)}
                          </div>
                          <div className='mt-1 text-xs text-[var(--va-text-muted,#6b7280)]'>
                            {Number(item.total_tokens || 0).toLocaleString()} tokens
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StandalonePageShell>
  );
};

export default StandaloneDengKingRanking;
