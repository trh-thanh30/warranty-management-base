import { useCallback, useMemo, useState } from "react";
import { usePagination, type UsePaginationOptions } from "./use-pagination";

export type SortDirection = "asc" | "desc";

export type TableSort<TItem> = {
  direction: SortDirection;
  key: keyof TItem;
};

export type UseTableOptions<TItem> = UsePaginationOptions & {
  data: TItem[];
  filter?: (item: TItem, query: string) => boolean;
  initialQuery?: string;
  initialSort?: TableSort<TItem> | null;
  sorters?: Partial<Record<keyof TItem, (left: TItem, right: TItem) => number>>;
};

function defaultCompare(left: unknown, right: unknown) {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right ?? ""));
}

export function useTable<TItem>(options: UseTableOptions<TItem>) {
  const {
    data,
    filter,
    initialQuery = "",
    initialSort = null,
    sorters,
    ...paginationOptions
  } = options;
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<TableSort<TItem> | null>(initialSort);

  const filteredData = useMemo(() => {
    if (!query || !filter) {
      return data;
    }

    return data.filter((item) => filter(item, query));
  }, [data, filter, query]);

  const sortedData = useMemo(() => {
    if (!sort) {
      return filteredData;
    }

    const sorter = sorters?.[sort.key];
    const directionMultiplier = sort.direction === "asc" ? 1 : -1;

    return [...filteredData].sort((left, right) => {
      const result = sorter
        ? sorter(left, right)
        : defaultCompare(left[sort.key], right[sort.key]);
      return result * directionMultiplier;
    });
  }, [filteredData, sort, sorters]);

  const pagination = usePagination({
    ...paginationOptions,
    totalItems: sortedData.length,
  });
  const { reset: resetPagination } = pagination;

  const pageData = useMemo(() => {
    return sortedData.slice(
      pagination.offset,
      pagination.offset + pagination.pageSize,
    );
  }, [pagination.offset, pagination.pageSize, sortedData]);

  const toggleSort = useCallback((key: keyof TItem) => {
    setSort((current) => {
      if (!current || current.key !== key) {
        return { direction: "asc", key };
      }

      if (current.direction === "asc") {
        return { direction: "desc", key };
      }

      return null;
    });
  }, []);

  const reset = useCallback(() => {
    setQuery(initialQuery);
    setSort(initialSort);
    resetPagination();
  }, [initialQuery, initialSort, resetPagination]);

  return {
    allRows: sortedData,
    filteredRows: filteredData,
    pageRows: pageData,
    pagination,
    query,
    reset,
    setQuery,
    setSort,
    sort,
    toggleSort,
    totalRows: sortedData.length,
  };
}
