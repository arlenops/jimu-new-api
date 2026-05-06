import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@douyinfe/semi-ui';
import { Crown, Medal, RefreshCw, Trophy } from 'lucide-react';
import StandalonePageShell from '../../components/common/layout/StandalonePageShell';
import { API, renderQuota, showError, timestamp2string } from '../../helpers';

const rankIcons = [Crown, Trophy, Medal];
const rankColors = ['#10ac5c', '#3b82f6', '#e58e00'];
const defaultRankColor = '#94a3b8';

const maskUsername = (username, t) => {
  if (!username) {
    return t('匿名用户');
  }

  const chars = Array.from(username);
  const visibleCount = chars.length <= 1 ? 1 : Math.ceil(chars.length / 2);

  return `${chars.slice(0, visibleCount).join('')}${'*'.repeat(
    Math.max(0, chars.length - visibleCount),
  )}`;
};

const getDisplayName = (item, t) => maskUsername(item?.username, t);

const getAvatarText = (name) => {
  const chars = Array.from(name || '');
  return chars.slice(0, 2).join('').toUpperCase() || 'U';
};

const PodiumItem = ({ item, t }) => {
  if (!item) return null;

  const Icon = item.icon || Trophy;
  const displayName = getDisplayName(item, t);
  const rankClass = `rank-${item.displayRank}`;
  const isFirst = item.displayRank === 1;

  return (
    <div className={`va-king-podium-item ${rankClass}`}>
      <div className='va-king-podium-base' />
      {isFirst ? (
        <div className='va-king-equalizer'>
          {[0, 1, 2, 3, 4].map((index) => (
            <span key={index} />
          ))}
        </div>
      ) : null}
      <div className='va-king-halo' />
      <div className='va-king-icon-float'>
        <Icon size={isFirst ? 56 : 44} strokeWidth={1.8} />
      </div>

      <div className='va-king-glass-pillar'>
        <div className='va-king-pillar-data'>
          <span className='va-king-cost'>
            {renderQuota(item.total_quota || 0)}
          </span>
          <span className='va-king-requests'>
            {t('请求')}: {Number(item.request_count || 0).toLocaleString()}
          </span>
          <span className='va-king-name'>{displayName}</span>
          <span className='va-king-tokens'>
            {Number(item.total_tokens || 0).toLocaleString()} tokens
          </span>
        </div>
      </div>

      <div className='va-king-avatar-wrap'>
        <span>{getAvatarText(displayName)}</span>
      </div>
    </div>
  );
};

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

  const topThreeItems = useMemo(() => {
    const first = leaderboardItems[0];
    const second = leaderboardItems[1];
    const third = leaderboardItems[2];
    return [second, first, third].filter(Boolean);
  }, [leaderboardItems]);

  const listItems = useMemo(
    () => leaderboardItems.slice(3),
    [leaderboardItems],
  );

  const totalTokens = useMemo(
    () =>
      leaderboardItems.reduce(
        (sum, item) => sum + Number(item.total_tokens || 0),
        0,
      ),
    [leaderboardItems],
  );

  const totalQuota = useMemo(
    () =>
      leaderboardItems.reduce(
        (sum, item) => sum + Number(item.total_quota || 0),
        0,
      ),
    [leaderboardItems],
  );

  const leaderShare = useMemo(() => {
    if (!totalQuota || !leaderboardItems[0]?.total_quota) return 0;
    return Math.min(
      92,
      Math.max(
        18,
        Math.round(
          (Number(leaderboardItems[0].total_quota) / totalQuota) * 100,
        ),
      ),
    );
  }, [leaderboardItems, totalQuota]);

  return (
    <StandalonePageShell
      showHero={false}
      contentWidthClass='max-w-[1380px]'
      eyebrow={t('Daily Burn Board')}
      title={t('今日国王')}
      description={t(
        '按今日消费额度实时统计前十名用户，方便快速查看当天消耗最猛的账号。',
      )}
      badge={`${t('Top 10')} · ${t('当日消耗')}`}
    >
      <section className='va-king-screen'>
        <style>{`
          .va-king-screen {
            --king-bg: #f0f4f8;
            --king-panel: rgba(255, 255, 255, 0.72);
            --king-border: rgba(15, 23, 42, 0.08);
            --king-green: #10ac5c;
            --king-blue: #3b82f6;
            --king-gold: #e58e00;
            --king-text: #1e293b;
            --king-muted: #64748b;
            position: relative;
            min-height: calc(100dvh - 122px);
            margin-top: -28px;
            overflow: hidden;
            border-radius: 24px;
            padding: 20px 24px 18px;
            color: var(--king-text);
            background:
              radial-gradient(circle at center 18%, rgba(16, 172, 92, 0.1) 0%, transparent 52%),
              linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(15, 23, 42, 0.035) 1px, transparent 1px),
              var(--king-bg);
            background-size: 100% 100%, 40px 40px, 40px 40px, 100% 100%;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
          }

          .va-king-dashboard {
            position: relative;
            z-index: 1;
            display: flex;
            width: 100%;
            flex-direction: column;
            gap: 14px;
          }

          .va-king-header {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            gap: 14px;
            padding: 0 6px;
          }

          .va-king-title {
            color: #0f172a;
            font-size: 22px;
            font-weight: 650;
            letter-spacing: 0.08em;
            line-height: 1.1;
          }

          .va-king-time {
            margin-top: 4px;
            color: var(--king-muted);
            font-size: 11px;
          }

          .va-king-center {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            min-width: 0;
          }

          .va-king-main-title {
            color: var(--king-green);
            font-size: 28px;
            font-weight: 750;
            letter-spacing: 0.12em;
            line-height: 1;
            text-shadow: 0 10px 26px rgba(16, 172, 92, 0.26);
            white-space: nowrap;
          }

          .va-king-line {
            width: 42px;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--king-green));
          }

          .va-king-line-right {
            background: linear-gradient(-90deg, transparent, var(--king-green));
          }

          .va-king-refresh {
            justify-self: end;
            border-color: rgba(15, 23, 42, 0.1) !important;
            background: rgba(255, 255, 255, 0.8) !important;
            color: #334155 !important;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
            backdrop-filter: blur(8px);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .va-king-refresh:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
          }

          .va-king-main {
            display: grid;
            grid-template-columns: minmax(540px, 1fr) minmax(360px, 0.82fr);
            gap: 24px 30px;
            align-items: stretch;
            border: 1px solid var(--king-border);
            border-radius: 22px;
            padding: 26px 30px 20px;
            background: var(--king-panel);
            box-shadow: 0 22px 44px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.78);
            backdrop-filter: blur(20px);
          }

          .va-king-podium-section {
            position: relative;
            display: flex;
            min-height: 372px;
            align-items: flex-end;
            justify-content: center;
            gap: 24px;
            padding-bottom: 52px;
          }

          .va-king-podium-section::after {
            content: '';
            position: absolute;
            bottom: -6px;
            width: 86%;
            height: 62px;
            border-radius: 999px;
            background: radial-gradient(ellipse at center, rgba(16, 172, 92, 0.12) 0%, transparent 70%);
            pointer-events: none;
          }

          .va-king-podium-item {
            position: relative;
            display: flex;
            align-items: center;
            flex-direction: column;
            animation: vaKingLoad 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .va-king-podium-item.rank-1 {
            z-index: 5;
          }

          .va-king-podium-item.rank-2,
          .va-king-podium-item.rank-3 {
            z-index: 3;
          }

          .va-king-podium-base {
            position: absolute;
            z-index: 0;
            bottom: -26px;
            width: 150px;
            height: 52px;
            border: 1px solid rgba(255, 255, 255, 0.95);
            border-radius: 50%;
            background: radial-gradient(ellipse at center, #ffffff 0%, #f1f5f9 100%);
            box-shadow: 0 12px 0 #cbd5e1, 0 20px 18px rgba(15, 23, 42, 0.08), inset 0 2px 3px rgba(255, 255, 255, 1);
          }

          .rank-1 .va-king-podium-base {
            bottom: -32px;
            width: 202px;
            height: 66px;
            background: radial-gradient(ellipse at center, #ffffff 0%, #e2e8f0 100%);
            box-shadow: 0 20px 0 #cbd5e1, 0 32px 26px rgba(15, 23, 42, 0.1), inset 0 2px 4px rgba(255, 255, 255, 1), inset 0 0 16px rgba(16, 172, 92, 0.06);
          }

          .va-king-equalizer {
            position: absolute;
            z-index: 15;
            bottom: -48px;
            display: flex;
            height: 15px;
            align-items: flex-end;
            gap: 4px;
          }

          .va-king-equalizer span {
            width: 3px;
            border-radius: 2px;
            background: var(--king-green);
            box-shadow: 0 0 5px rgba(16, 172, 92, 0.78);
            animation: vaKingEq 0.8s infinite ease-in-out alternate;
          }

          .va-king-equalizer span:nth-child(1) { height: 60%; animation-delay: 0.1s; }
          .va-king-equalizer span:nth-child(2) { height: 100%; animation-delay: 0.3s; }
          .va-king-equalizer span:nth-child(3) { height: 40%; animation-delay: 0s; }
          .va-king-equalizer span:nth-child(4) { height: 80%; animation-delay: 0.2s; }
          .va-king-equalizer span:nth-child(5) { height: 50%; animation-delay: 0.4s; }

          .va-king-glass-pillar {
            position: relative;
            z-index: 2;
            display: flex;
            width: 112px;
            align-items: center;
            flex-direction: column;
            padding-top: 26px;
            backdrop-filter: blur(8px);
            animation: vaKingFloatPillar 4s ease-in-out infinite alternate;
          }

          .rank-1 .va-king-glass-pillar {
            height: 238px;
            border-right: 2px solid rgba(16, 172, 92, 0.4);
            border-left: 2px solid rgba(16, 172, 92, 0.4);
            background: linear-gradient(180deg, rgba(16, 172, 92, 0.15) 0%, rgba(16, 172, 92, 0.02) 100%);
            box-shadow: inset 0 0 22px rgba(16, 172, 92, 0.1);
          }

          .rank-2 .va-king-glass-pillar {
            height: 176px;
            border-right: 1px solid rgba(59, 130, 246, 0.4);
            border-left: 1px solid rgba(59, 130, 246, 0.4);
            background: linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%);
            animation-delay: -1s;
          }

          .rank-3 .va-king-glass-pillar {
            height: 152px;
            border-right: 1px solid rgba(229, 142, 0, 0.4);
            border-left: 1px solid rgba(229, 142, 0, 0.4);
            background: linear-gradient(180deg, rgba(229, 142, 0, 0.1) 0%, rgba(229, 142, 0, 0.02) 100%);
            animation-delay: -2s;
          }

          .va-king-glass-pillar::before,
          .va-king-glass-pillar::after {
            content: '';
            position: absolute;
            right: -1px;
            left: -1px;
            height: 26px;
            border-radius: 50%;
          }

          .va-king-glass-pillar::before {
            top: -13px;
            z-index: 2;
            background: rgba(255, 255, 255, 0.6);
          }

          .va-king-glass-pillar::after {
            bottom: -13px;
            z-index: 0;
          }

          .rank-1 .va-king-glass-pillar::before {
            border: 2px solid var(--king-green);
            box-shadow: 0 2px 12px rgba(16, 172, 92, 0.22), inset 0 0 12px rgba(16, 172, 92, 0.18);
          }

          .rank-1 .va-king-glass-pillar::after {
            border-bottom: 2px solid rgba(16, 172, 92, 0.5);
            background: rgba(16, 172, 92, 0.05);
          }

          .rank-2 .va-king-glass-pillar::before {
            border: 1px solid var(--king-blue);
            box-shadow: 0 2px 10px rgba(59, 130, 246, 0.12);
          }

          .rank-2 .va-king-glass-pillar::after {
            border-bottom: 1px solid rgba(59, 130, 246, 0.4);
          }

          .rank-3 .va-king-glass-pillar::before {
            border: 1px solid var(--king-gold);
            box-shadow: 0 2px 10px rgba(229, 142, 0, 0.12);
          }

          .rank-3 .va-king-glass-pillar::after {
            border-bottom: 1px solid rgba(229, 142, 0, 0.4);
          }

          .va-king-pillar-data {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-top: 8px;
            text-align: center;
          }

          .va-king-cost {
            font-size: 21px;
            font-weight: 760;
            letter-spacing: -0.03em;
          }

          .rank-1 .va-king-cost {
            color: var(--king-green);
            font-size: 25px;
            text-shadow: 0 6px 16px rgba(16, 172, 92, 0.22);
          }

          .rank-2 .va-king-cost {
            color: var(--king-blue);
            text-shadow: 0 6px 16px rgba(59, 130, 246, 0.18);
          }

          .rank-3 .va-king-cost {
            color: var(--king-gold);
            text-shadow: 0 6px 16px rgba(229, 142, 0, 0.18);
          }

          .va-king-requests,
          .va-king-tokens {
            color: var(--king-muted);
            font-size: 11px;
          }

          .va-king-name {
            margin-top: 11px;
            color: var(--king-text);
            font-size: 13px;
            font-weight: 650;
          }

          .rank-1 .va-king-name {
            font-size: 15px;
          }

          .va-king-icon-float {
            position: absolute;
            z-index: 20;
            top: -54px;
            animation: vaKingFloatObj 3s ease-in-out infinite alternate;
          }

          .rank-1 .va-king-icon-float {
            top: -74px;
            color: var(--king-green);
            filter: drop-shadow(0 8px 10px rgba(16, 172, 92, 0.28));
          }

          .rank-2 .va-king-icon-float {
            color: var(--king-blue);
            filter: drop-shadow(0 8px 10px rgba(59, 130, 246, 0.22));
          }

          .rank-3 .va-king-icon-float {
            color: var(--king-gold);
            filter: drop-shadow(0 8px 10px rgba(229, 142, 0, 0.22));
          }

          .va-king-halo {
            position: absolute;
            z-index: 20;
            top: -62px;
            left: 50%;
            width: 124px;
            height: 124px;
            margin-left: -62px;
            border-radius: 50%;
            animation: vaKingHaloSpin 6s linear infinite;
          }

          .rank-1 .va-king-halo {
            top: -78px;
            width: 148px;
            height: 148px;
            margin-left: -74px;
          }

          .va-king-halo::before,
          .va-king-halo::after {
            content: '';
            position: absolute;
            border-radius: 50%;
          }

          .va-king-halo::before {
            inset: 0;
            border: 2px solid;
            border-right-color: transparent !important;
            border-left-color: transparent !important;
            opacity: 0.82;
          }

          .va-king-halo::after {
            inset: 15px;
            border: 1px dashed;
            opacity: 0.42;
          }

          .rank-1 .va-king-halo::before {
            border-color: var(--king-green);
            box-shadow: 0 0 12px rgba(16, 172, 92, 0.28);
          }

          .rank-1 .va-king-halo::after {
            border-color: var(--king-green);
          }

          .rank-2 .va-king-halo::before {
            border-color: var(--king-blue);
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
          }

          .rank-2 .va-king-halo::after {
            border-color: var(--king-blue);
          }

          .rank-3 .va-king-halo::before {
            border-color: var(--king-gold);
            box-shadow: 0 0 10px rgba(229, 142, 0, 0.2);
          }

          .rank-3 .va-king-halo::after {
            border-color: var(--king-gold);
          }

          .va-king-avatar-wrap {
            position: absolute;
            z-index: 20;
            bottom: -32px;
            display: flex;
            width: 46px;
            height: 46px;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 50%;
            background: #fff;
            color: #0f172a;
            font-size: 13px;
            font-weight: 700;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1);
          }

          .rank-1 .va-king-avatar-wrap {
            bottom: -40px;
            width: 60px;
            height: 60px;
            border: 2px solid var(--king-green);
            color: var(--king-green);
            font-size: 17px;
            box-shadow: 0 0 18px rgba(16, 172, 92, 0.2), 0 12px 22px rgba(15, 23, 42, 0.12);
          }

          .rank-2 .va-king-avatar-wrap {
            border: 2px solid var(--king-blue);
            color: var(--king-blue);
          }

          .rank-3 .va-king-avatar-wrap {
            border: 2px solid var(--king-gold);
            color: var(--king-gold);
          }

          .va-king-list-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 8px;
          }

          .va-king-list-item {
            position: relative;
            display: flex;
            align-items: center;
            overflow: hidden;
            min-height: 54px;
            border: 1px solid rgba(15, 23, 42, 0.05);
            border-radius: 9px;
            padding: 9px 16px;
            background: rgba(255, 255, 255, 0.62);
            backdrop-filter: blur(10px);
            opacity: 0;
            transform: translateY(10px);
            animation: vaKingListIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .va-king-list-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 3px;
            height: 100%;
            background: transparent;
            transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .va-king-list-item:hover {
            transform: translateX(-5px);
            border-color: rgba(16, 172, 92, 0.3);
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          }

          .va-king-list-item:hover::before {
            background: var(--king-green);
            box-shadow: 0 0 12px rgba(16, 172, 92, 0.48);
          }

          .va-king-list-rank {
            width: 36px;
            color: var(--king-muted);
            font-size: 17px;
            font-weight: 750;
            text-align: center;
          }

          .va-king-list-info {
            min-width: 0;
            flex: 1;
            margin-left: 10px;
          }

          .va-king-list-name {
            overflow: hidden;
            color: var(--king-text);
            font-size: 14px;
            font-weight: 620;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .va-king-list-tokens {
            margin-top: 3px;
            color: var(--king-muted);
            font-size: 11px;
          }

          .va-king-list-data {
            display: flex;
            align-items: flex-end;
            flex-direction: column;
            text-align: right;
          }

          .va-king-list-cost {
            color: var(--king-green);
            font-size: 15px;
            font-weight: 760;
            letter-spacing: -0.02em;
            text-shadow: 0 5px 12px rgba(16, 172, 92, 0.12);
          }

          .va-king-list-req {
            margin-top: 2px;
            color: var(--king-muted);
            font-size: 11px;
          }

          .va-king-progress-container {
            grid-column: 1 / -1;
            margin-top: 0;
          }

          .va-king-progress-text {
            margin-bottom: 7px;
            color: var(--king-muted);
            font-size: 12px;
            font-weight: 620;
          }

          .va-king-progress-bg {
            position: relative;
            width: 100%;
            height: 4px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.06);
          }

          .va-king-progress-fill {
            height: 100%;
            border-radius: inherit;
            background: var(--king-green);
            box-shadow: 0 0 10px rgba(16, 172, 92, 0.42);
          }

          .va-king-empty {
            grid-column: 1 / -1;
            padding: 80px 24px;
            text-align: center;
            color: var(--king-muted);
          }

          @keyframes vaKingFloatPillar {
            0% { transform: translateY(0); }
            100% { transform: translateY(-8px); }
          }

          @keyframes vaKingFloatObj {
            0% { transform: translateY(0); }
            100% { transform: translateY(-12px); }
          }

          @keyframes vaKingHaloSpin {
            0% { transform: rotateX(75deg) rotateZ(0deg); }
            100% { transform: rotateX(75deg) rotateZ(360deg); }
          }

          @keyframes vaKingEq {
            0% { height: 20%; }
            100% { height: 100%; }
          }

          @keyframes vaKingListIn {
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes vaKingLoad {
            0% {
              opacity: 0;
              transform: translateY(18px) scale(0.98);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 1180px) {
            .va-king-main {
              grid-template-columns: 1fr;
            }

            .va-king-podium-section {
              min-height: 372px;
            }
          }

          @media (max-width: 760px) {
            .va-king-screen {
              border-radius: 20px;
              padding: 18px;
            }

            .va-king-header {
              grid-template-columns: 1fr;
              align-items: flex-start;
            }

            .va-king-center {
              order: -1;
              justify-content: flex-start;
            }

            .va-king-main-title {
              font-size: 27px;
            }

            .va-king-line {
              width: 34px;
            }

            .va-king-refresh {
              justify-self: start;
            }

            .va-king-main {
              gap: 28px;
              padding: 24px 16px;
            }

            .va-king-podium-section {
              min-height: 385px;
              gap: 8px;
              overflow-x: auto;
              justify-content: flex-start;
              padding-right: 22px;
              padding-left: 22px;
            }

            .va-king-glass-pillar {
              width: 112px;
            }

            .rank-1 .va-king-glass-pillar {
              height: 252px;
            }

            .rank-2 .va-king-glass-pillar {
              height: 190px;
            }

            .rank-3 .va-king-glass-pillar {
              height: 162px;
            }

            .va-king-list-item {
              padding: 12px 14px;
            }
          }
        `}</style>

        <div className='va-king-dashboard'>
          <header className='va-king-header'>
            <div>
              <div className='va-king-title'>{t('今日国王')}</div>
              <div className='va-king-time'>
                {meta.end_timestamp
                  ? `${t('更新时间')} - ${timestamp2string(meta.end_timestamp)}`
                  : t('等待数据加载')}
              </div>
            </div>

            <div className='va-king-center'>
              <div className='va-king-line' />
              <div className='va-king-main-title'>{t('今日国王')}</div>
              <div className='va-king-line va-king-line-right' />
            </div>

            <Button
              className='va-king-refresh'
              theme='outline'
              type='tertiary'
              icon={<RefreshCw size={15} />}
              onClick={loadLeaderboard}
              loading={loading}
            >
              {t('刷新')}
            </Button>
          </header>

          <main className='va-king-main'>
            {leaderboardItems.length > 0 ? (
              <>
                <div className='va-king-podium-section'>
                  {topThreeItems.map((item) => (
                    <PodiumItem key={item.user_id} item={item} t={t} />
                  ))}
                </div>

                <div className='va-king-list-section'>
                  {listItems.map((item, index) => (
                    <div
                      key={item.user_id}
                      className='va-king-list-item'
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className='va-king-list-rank'>
                        {item.displayRank}
                      </div>
                      <div className='va-king-list-info'>
                        <div className='va-king-list-name'>
                          {getDisplayName(item, t)}
                        </div>
                        <div className='va-king-list-tokens'>
                          {Number(item.total_tokens || 0).toLocaleString()}{' '}
                          tokens
                        </div>
                      </div>
                      <div className='va-king-list-data'>
                        <div className='va-king-list-cost'>
                          {renderQuota(item.total_quota || 0)}
                        </div>
                        <div className='va-king-list-req'>
                          {t('请求')}:{' '}
                          {Number(item.request_count || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='va-king-progress-container'>
                  <div className='va-king-progress-text'>
                    Total {Number(totalTokens || 0).toLocaleString()} tokens
                  </div>
                  <div className='va-king-progress-bg'>
                    <div
                      className='va-king-progress-fill'
                      style={{ width: `${leaderShare}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className='va-king-empty'>
                {loading ? t('加载中') : t('暂无排行数据')}
              </div>
            )}
          </main>
        </div>
      </section>
    </StandalonePageShell>
  );
};

export default StandaloneDengKingRanking;
