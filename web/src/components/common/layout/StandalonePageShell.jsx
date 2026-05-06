import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const StandalonePageShell = ({
  eyebrow,
  title,
  description,
  badge,
  showHero = true,
  contentWidthClass = 'max-w-7xl',
  children,
}) => {
  useEffect(() => {
    document.body.classList.add('va-standalone-mode');
    return () => {
      document.body.classList.remove('va-standalone-mode');
    };
  }, []);

  return (
    <div className='va-standalone-shell min-h-screen w-full overflow-x-hidden px-4 pb-16 pt-[108px] md:px-6 md:pt-[120px] lg:px-8'>
      <div
        className={`mx-auto flex w-full ${contentWidthClass} flex-col ${showHero ? 'gap-5' : ''}`}
      >
        {showHero ? (
          <section className='va-standalone-hero rounded-[10px] border p-4 md:p-6 xl:p-7'>
            <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
              <div className='flex max-w-4xl flex-col gap-3'>
                {eyebrow ? (
                  <div className='text-xs uppercase tracking-[0.24em] text-[var(--va-text-soft)]'>
                    {eyebrow}
                  </div>
                ) : null}
                <h1
                  className='m-0 text-4xl font-normal leading-[1.02] md:text-6xl'
                  style={{ letterSpacing: '-0.05em' }}
                >
                  {title}
                </h1>
                {description ? (
                  <p className='m-0 max-w-3xl text-base text-[var(--va-text-muted)] md:text-lg'>
                    {description}
                  </p>
                ) : null}
              </div>

              {badge ? (
                <div className='va-standalone-badge rounded-[8px] border px-4 py-3'>
                  {badge}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className='va-standalone-body'>{children}</div>
      </div>
    </div>
  );
};

StandalonePageShell.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  badge: PropTypes.node,
  showHero: PropTypes.bool,
  contentWidthClass: PropTypes.string,
  children: PropTypes.node,
};

export default StandalonePageShell;
