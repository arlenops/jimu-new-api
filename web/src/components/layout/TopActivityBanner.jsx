import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const defaultBanner = {
  enabled: false,
  label: '限时活动',
  content: '',
  cta_text: '立即查看',
  cta_link: '/token-management',
  start_time: '',
  end_time: '',
};

const parseTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const getBannerKey = (banner) =>
  [
    banner?.label || '',
    banner?.content || '',
    banner?.cta_text || '',
    banner?.cta_link || '',
    banner?.end_time || '',
  ].join('|');

const isExternalLink = (link = '') => /^https?:\/\//i.test(link);

const TopActivityBanner = ({
  banner,
  dismissible = true,
  preview = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const bannerRef = useRef(null);
  const normalizedBanner = useMemo(
    () => ({
      ...defaultBanner,
      ...(banner || {}),
    }),
    [banner],
  );
  const [now, setNow] = useState(() => new Date());
  const bannerKey = useMemo(
    () => getBannerKey(normalizedBanner),
    [normalizedBanner],
  );
  const [dismissedKey, setDismissedKey] = useState(() =>
    preview ? '' : localStorage.getItem('top_activity_banner_dismissed_key') || '',
  );

  const startTime = parseTime(normalizedBanner.start_time);
  const endTime = parseTime(normalizedBanner.end_time);

  useEffect(() => {
    if (!endTime) return undefined;
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, [normalizedBanner.end_time]);

  const isInWindow =
    (!startTime || now >= startTime) && (!endTime || now <= endTime);
  const shouldShow =
    normalizedBanner.enabled &&
    normalizedBanner.content &&
    isInWindow &&
    (preview || dismissedKey !== bannerKey);

  useLayoutEffect(() => {
    if (preview) return undefined;

    const root = document.documentElement;
    const updateHeaderOffset = () => {
      const height = shouldShow ? bannerRef.current?.offsetHeight || 0 : 0;
      root.style.setProperty('--app-header-marquee-height', `${height}px`);
    };

    updateHeaderOffset();

    if (!shouldShow || !bannerRef.current) {
      return () => {
        root.style.setProperty('--app-header-marquee-height', '0px');
      };
    }

    if (!window.ResizeObserver) {
      return () => {
        root.style.setProperty('--app-header-marquee-height', '0px');
      };
    }

    const observer = new ResizeObserver(updateHeaderOffset);
    observer.observe(bannerRef.current);
    window.addEventListener('resize', updateHeaderOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeaderOffset);
      root.style.setProperty('--app-header-marquee-height', '0px');
    };
  }, [preview, shouldShow, bannerKey]);

  if (!shouldShow) {
    return null;
  }

  const remainingText = (() => {
    if (!endTime) return '';
    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return '';
    const minutes = Math.max(1, Math.floor(diff / 60000));
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    if (hours <= 0) return t('{{minutes}} 分钟后结束', { minutes });
    return t('{{hours}} 小时 {{minutes}} 分钟后结束', {
      hours,
      minutes: restMinutes,
    });
  })();

  const handleDismiss = () => {
    localStorage.setItem('top_activity_banner_dismissed_key', bannerKey);
    setDismissedKey(bannerKey);
  };

  const ctaLink = normalizedBanner.cta_link || defaultBanner.cta_link;
  const ctaText = normalizedBanner.cta_text || defaultBanner.cta_text;
  const ctaNode = preview ? (
    <span className='va-top-activity-cta'>{ctaText}</span>
  ) : isExternalLink(ctaLink) ? (
    <a
      className='va-top-activity-cta'
      href={ctaLink}
      target='_blank'
      rel='noreferrer'
    >
      {ctaText}
    </a>
  ) : (
    <Link className='va-top-activity-cta' to={ctaLink}>
      {ctaText}
    </Link>
  );

  return (
    <div ref={bannerRef} className={`va-top-activity-banner ${className}`}>
      <div className='va-top-activity-inner'>
        <div className='va-top-activity-badge'>
          <Sparkles size={14} />
          <span>{normalizedBanner.label || defaultBanner.label}</span>
        </div>
        <div className='va-top-activity-content'>
          <Megaphone size={16} />
          <strong>{normalizedBanner.content}</strong>
          {remainingText ? <small>{remainingText}</small> : null}
        </div>
        <div className='va-top-activity-actions'>
          {ctaNode}
          {dismissible ? (
            <button
              className='va-top-activity-close'
              type='button'
              aria-label={t('关闭')}
              onClick={handleDismiss}
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TopActivityBanner;
