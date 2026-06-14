import { useCallback, useEffect, useMemo, useState } from "react";

export type UsePaginationOptions = {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  totalItems?: number;
};

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    totalItems = 0,
  } = options;
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [pageSize, totalItems],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(Math.min(Math.max(1, nextPage), totalPages));
    },
    [totalPages],
  );

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPageState(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage(page + 1);
  }, [page, setPage]);

  const previousPage = useCallback(() => {
    setPage(page - 1);
  }, [page, setPage]);

  const reset = useCallback(() => {
    setPageState(initialPage);
    setPageSizeState(initialPageSize);
  }, [initialPage, initialPageSize]);

  useEffect(() => {
    setPageState((currentPage) =>
      Math.min(Math.max(1, currentPage), totalPages),
    );
  }, [totalPages]);

  return {
    canNextPage: page < totalPages,
    canPreviousPage: page > 1,
    limit: pageSize,
    nextPage,
    offset: (page - 1) * pageSize,
    page,
    pageSize,
    pageSizeOptions,
    previousPage,
    reset,
    setPage,
    setPageSize,
    startIndex: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    endIndex: Math.min(page * pageSize, totalItems),
    totalItems,
    totalPages,
  };
}
