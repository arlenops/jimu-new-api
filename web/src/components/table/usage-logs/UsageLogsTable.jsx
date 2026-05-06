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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Descriptions } from '@douyinfe/semi-ui';
import CardTable from '../../common/ui/CardTable';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { getLogsColumns } from './UsageLogsColumnDefs';
import { useIsMobile } from '../../../hooks/common/useIsMobile';

const LogsTable = (logsData) => {
  const {
    logs,
    expandData,
    loading,
    activePage,
    pageSize,
    logCount,
    compactMode,
    visibleColumns,
    handlePageChange,
    handlePageSizeChange,
    copyText,
    showUserInfoFunc,
    openChannelAffinityUsageCacheModal,
    hasExpandableRows,
    isAdminUser,
    billingDisplayMode,
    t,
    COLUMN_KEYS,
  } = logsData;
  const isMobile = useIsMobile();
  const tableShellRef = useRef(null);
  const topScrollbarRef = useRef(null);
  const tableScrollerRef = useRef(null);
  const syncLockRef = useRef(false);
  const [topScrollbarWidth, setTopScrollbarWidth] = useState(0);

  // Get all columns
  const allColumns = useMemo(() => {
    return getLogsColumns({
      t,
      COLUMN_KEYS,
      copyText,
      showUserInfoFunc,
      openChannelAffinityUsageCacheModal,
      isAdminUser,
      billingDisplayMode,
    });
  }, [
    t,
    COLUMN_KEYS,
    copyText,
    showUserInfoFunc,
    openChannelAffinityUsageCacheModal,
    isAdminUser,
    billingDisplayMode,
  ]);

  // Filter columns based on visibility settings
  const getVisibleColumns = () => {
    return allColumns.filter((column) => visibleColumns[column.key]);
  };

  const visibleColumnsList = useMemo(() => {
    return getVisibleColumns();
  }, [visibleColumns, allColumns]);

  const tableColumns = useMemo(() => {
    return compactMode
      ? visibleColumnsList.map(({ fixed, ...rest }) => rest)
      : visibleColumnsList;
  }, [compactMode, visibleColumnsList]);

  const expandRowRender = (record, index) => {
    return <Descriptions data={expandData[record.key]} />;
  };

  const handleTopScrollbarScroll = useCallback(() => {
    if (!topScrollbarRef.current || !tableScrollerRef.current) {
      return;
    }
    if (syncLockRef.current) {
      return;
    }
    syncLockRef.current = true;
    tableScrollerRef.current.scrollLeft = topScrollbarRef.current.scrollLeft;
    requestAnimationFrame(() => {
      syncLockRef.current = false;
    });
  }, []);

  useEffect(() => {
    if (isMobile || compactMode) {
      setTopScrollbarWidth(0);
      return;
    }

    const shell = tableShellRef.current;
    if (!shell) {
      return;
    }

    const resolveScroller = () => {
      const candidates = [
        '.semi-table-content',
        '.semi-table-container',
        '.semi-table-body',
      ];
      for (const selector of candidates) {
        const element = shell.querySelector(selector);
        if (element && element.scrollWidth > element.clientWidth) {
          return element;
        }
      }
      return shell.querySelector('.semi-table-content, .semi-table-container, .semi-table-body');
    };

    const syncWidths = () => {
      const scroller = resolveScroller();
      tableScrollerRef.current = scroller;
      if (!scroller) {
        setTopScrollbarWidth(0);
        return;
      }
      setTopScrollbarWidth(
        scroller.scrollWidth > scroller.clientWidth ? scroller.scrollWidth : 0,
      );
      if (topScrollbarRef.current) {
        topScrollbarRef.current.scrollLeft = scroller.scrollLeft;
      }
    };

    syncWidths();

    const observer = new ResizeObserver(() => {
      syncWidths();
    });
    observer.observe(shell);

    const currentScroller = resolveScroller();
    if (currentScroller) {
      observer.observe(currentScroller);
    }

    const handleTableScroll = () => {
      if (!topScrollbarRef.current || !tableScrollerRef.current) {
        return;
      }
      if (syncLockRef.current) {
        return;
      }
      syncLockRef.current = true;
      topScrollbarRef.current.scrollLeft = tableScrollerRef.current.scrollLeft;
      requestAnimationFrame(() => {
        syncLockRef.current = false;
      });
    };

    currentScroller?.addEventListener('scroll', handleTableScroll, {
      passive: true,
    });

    return () => {
      observer.disconnect();
      currentScroller?.removeEventListener('scroll', handleTableScroll);
    };
  }, [compactMode, isMobile, logs.length, visibleColumnsList.length]);

  return (
    <div ref={tableShellRef} className='va-logs-table-shell'>
      {!isMobile && !compactMode && topScrollbarWidth > 0 ? (
        <div
          ref={topScrollbarRef}
          className='va-top-scrollbar mb-2'
          onScroll={handleTopScrollbarScroll}
        >
          <div
            style={{
              width: topScrollbarWidth,
              height: 1,
            }}
          />
        </div>
      ) : null}

      <CardTable
        columns={tableColumns}
        {...(hasExpandableRows() && {
          expandedRowRender: expandRowRender,
          expandRowByClick: true,
          rowExpandable: (record) =>
            expandData[record.key] && expandData[record.key].length > 0,
        })}
        dataSource={logs}
        rowKey='key'
        loading={loading}
        scroll={compactMode ? undefined : { x: 'max-content' }}
        className='rounded-xl overflow-hidden'
        size='small'
        empty={
          <Empty
            image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
            darkModeImage={
              <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
            }
            description={t('搜索无结果')}
            style={{ padding: 30 }}
          />
        }
        pagination={{
          currentPage: activePage,
          pageSize: pageSize,
          total: logCount,
          pageSizeOptions: [10, 20, 50, 100],
          showSizeChanger: true,
          onPageSizeChange: (size) => {
            handlePageSizeChange(size);
          },
          onPageChange: handlePageChange,
        }}
        hidePagination={true}
      />
    </div>
  );
};

export default LogsTable;
