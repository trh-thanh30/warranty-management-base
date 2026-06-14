import { useCallback, useEffect, useMemo, useState } from "react";

export type QueryParamValue = boolean | null | number | string | undefined;
export type QueryParamInput = Record<
  string,
  QueryParamValue | QueryParamValue[]
>;

export type UseQueryParamsOptions = {
  historyMode?: "push" | "replace";
};

function readSearchParams() {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.search);
}

function serializeValue(value: Exclude<QueryParamValue, null | undefined>) {
  return String(value);
}

function applyQueryParams(input: QueryParamInput, mode: "push" | "replace") {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }

  const params = readSearchParams();

  Object.entries(input).forEach(([key, value]) => {
    params.delete(key);

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined && item !== "") {
          params.append(key, serializeValue(item));
        }
      });
      return;
    }

    if (value !== null && value !== undefined && value !== "") {
      params.set(key, serializeValue(value));
    }
  });

  const search = params.toString();
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;

  if (mode === "replace") {
    window.history.replaceState(null, "", nextUrl);
  } else {
    window.history.pushState(null, "", nextUrl);
  }

  return params;
}

export function useQueryParams(options: UseQueryParamsOptions = {}) {
  const { historyMode = "replace" } = options;
  const [params, setParams] = useState(() => readSearchParams());

  useEffect(() => {
    const sync = () => {
      setParams(readSearchParams());
    };

    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const query = useMemo(() => Object.fromEntries(params.entries()), [params]);

  const getParam = useCallback(
    (key: string) => {
      return params.get(key);
    },
    [params],
  );

  const getAllParams = useCallback(
    (key: string) => {
      return params.getAll(key);
    },
    [params],
  );

  const setQueryParams = useCallback(
    (input: QueryParamInput, mode = historyMode) => {
      setParams(applyQueryParams(input, mode));
    },
    [historyMode],
  );

  const removeQueryParams = useCallback(
    (keys: string | string[], mode = historyMode) => {
      const keyList = Array.isArray(keys) ? keys : [keys];
      const input = Object.fromEntries(keyList.map((key) => [key, null]));
      setParams(applyQueryParams(input, mode));
    },
    [historyMode],
  );

  const setQueryParam = useCallback(
    (
      key: string,
      value: QueryParamValue | QueryParamValue[],
      mode = historyMode,
    ) => {
      setParams(applyQueryParams({ [key]: value }, mode));
    },
    [historyMode],
  );

  const clearQueryParams = useCallback(
    (mode = historyMode) => {
      if (typeof window === "undefined") {
        setParams(new URLSearchParams());
        return;
      }

      const nextUrl = `${window.location.pathname}${window.location.hash}`;

      if (mode === "replace") {
        window.history.replaceState(null, "", nextUrl);
      } else {
        window.history.pushState(null, "", nextUrl);
      }

      setParams(new URLSearchParams());
    },
    [historyMode],
  );

  return {
    clearQueryParams,
    getAllParams,
    getParam,
    params,
    query,
    removeQueryParams,
    setQueryParam,
    setQueryParams,
  };
}
