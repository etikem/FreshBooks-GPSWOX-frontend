'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

/**
 * Client-side pagination over an already-fetched array. No backend round-trip —
 * we just slice the list the caller already holds. Use this for endpoints that
 * return the full result set in one shot (e.g. the reconciliation snapshot).
 *
 * The current page is clamped whenever the row count shrinks (a sweep refresh,
 * a tab/filter change) so we never strand the user on an empty page past the
 * end of the new list.
 */
export function usePagination<T>(rows: T[], pageSize = 25) {
  const [page, setPage] = useState(1);
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  );

  return { page, setPage, pageSize, total, totalPages, pageRows };
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Presentational pagination footer. Mirrors the clients-page footer so the two
 * read identically. Renders nothing when there's only a single page.
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div
      className={
        'px-4 py-3 border-t border-border flex items-center justify-between gap-3 text-sm ' +
        (className ?? '')
      }
    >
      <div className="text-ink-muted tabular">
        {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of{' '}
        {total.toLocaleString()}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          iconLeft={<ChevronLeft className="size-4" />}
        >
          Prev
        </Button>
        <span className="text-ink-muted tabular px-1">
          Page {page} / {totalPages}
        </span>
        <Button
          size="sm"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          iconRight={<ChevronRight className="size-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
