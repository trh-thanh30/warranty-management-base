"use client";

import { useCallback, useMemo, useState } from "react";
import type { SetStateAction } from "react";

type SortOrder = "asc" | "desc";

type UseTableControlsOptions<
  TFilters extends object,
  TSortBy extends string,
> = {
  initialFilters?: TFilters;
  initialPage?: number;
  initialPageSize?: number;
  initialSearch?: string;
  initialSortBy?: TSortBy;
  initialSortOrder?: SortOrder;
};

type TableFilterHandlers<TFilters extends object> = {
  [TKey in keyof TFilters]: (value: TFilters[TKey]) => void;
};

const EMPTY_TABLE_FILTERS = {} as Record<never, never>;

export function useTableControls<
  TFilters extends object = Record<never, never>,
  TSortBy extends string = string,
>(options: UseTableControlsOptions<TFilters, TSortBy> = {}) {
  const {
    initialFilters = EMPTY_TABLE_FILTERS as TFilters,
    initialPage = 1,
    initialPageSize = 10,
    initialSearch = "",
    initialSortBy,
    initialSortOrder = "desc",
  } = options;
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [search, setSearchState] = useState(initialSearch);
  const [filters, setFiltersState] = useState<TFilters>(initialFilters);
  const [sortBy, setSortByState] = useState<TSortBy | undefined>(initialSortBy);
  const [sortOrder, setSortOrderState] = useState<SortOrder>(initialSortOrder);

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage);
  }, []);

  const setSearch = useCallback((nextSearch: string) => {
    setSearchState(nextSearch);
    setPageState(1);
  }, []);

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPageState(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState("");
    setPageState(1);
  }, []);

  const setFilter = useCallback(
    <TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => {
      setFiltersState((current) => ({
        ...current,
        [key]: value,
      }));
      setPageState(1);
    },
    [],
  );

  const filterHandlers = useMemo(() => {
    const handlers = {} as TableFilterHandlers<TFilters>;

    for (const key of Object.keys(initialFilters) as Array<keyof TFilters>) {
      handlers[key] = ((value: TFilters[typeof key]) => {
        setFilter(key, value);
      }) as TableFilterHandlers<TFilters>[typeof key];
    }

    return handlers;
  }, [initialFilters, setFilter]);

  const setFilters = useCallback((nextFilters: SetStateAction<TFilters>) => {
    setFiltersState(nextFilters);
    setPageState(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setPageState(1);
  }, [initialFilters]);

  const resetControls = useCallback(() => {
    setPageState(initialPage);
    setPageSizeState(initialPageSize);
    setSearchState(initialSearch);
    setFiltersState(initialFilters);
    setSortByState(initialSortBy);
    setSortOrderState(initialSortOrder);
  }, [
    initialFilters,
    initialPage,
    initialPageSize,
    initialSearch,
    initialSortBy,
    initialSortOrder,
  ]);

  const setSort = useCallback(
    (nextSortBy: TSortBy, nextSortOrder: SortOrder) => {
      setSortByState(nextSortBy);
      setSortOrderState(nextSortOrder);
      setPageState(1);
    },
    [],
  );

  const toggleSort = useCallback(
    (nextSortBy: TSortBy) => {
      const isSameSort = sortBy === nextSortBy;

      setSortByState(nextSortBy);
      setSortOrderState(isSameSort && sortOrder === "asc" ? "desc" : "asc");
      setPageState(1);
    },
    [sortBy, sortOrder],
  );

  return {
    clearSearch,
    filterHandlers,
    filters,
    page,
    pageSize,
    resetControls,
    resetFilters,
    search,
    setFilter,
    setFilters,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    sortBy,
    sortOrder,
    toggleSort,
  };
}
