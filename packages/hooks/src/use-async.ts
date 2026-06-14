import { useCallback, useEffect, useRef, useState } from "react";
import type { DependencyList } from "react";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type UseAsyncState<TData, TError = Error> = {
  data: TData | null;
  error: TError | null;
  isError: boolean;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  status: AsyncStatus;
};

export type UseAsyncOptions<TData, TError = Error> = {
  immediate?: boolean;
  onError?: (error: TError) => void;
  onSuccess?: (data: TData) => void;
};

export function useAsync<TData, TArgs extends unknown[] = [], TError = Error>(
  asyncFunction: (...args: TArgs) => Promise<TData>,
  deps: DependencyList = [],
  options: UseAsyncOptions<TData, TError> = {},
) {
  const { immediate = false, onError, onSuccess } = options;
  const callIdRef = useRef(0);
  const mountedRef = useRef(true);
  const [state, setState] = useState<UseAsyncState<TData, TError>>({
    data: null,
    error: null,
    isError: false,
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    status: "idle",
  });

  const execute = useCallback(
    async (...args: TArgs) => {
      const callId = callIdRef.current + 1;
      callIdRef.current = callId;

      setState((current) => ({
        ...current,
        error: null,
        isError: false,
        isIdle: false,
        isLoading: true,
        isSuccess: false,
        status: "loading",
      }));

      try {
        const data = await asyncFunction(...args);

        if (callIdRef.current === callId) {
          if (!mountedRef.current) {
            return data;
          }

          setState({
            data,
            error: null,
            isError: false,
            isIdle: false,
            isLoading: false,
            isSuccess: true,
            status: "success",
          });
          onSuccess?.(data);
        }

        return data;
      } catch (error) {
        const nextError = error as TError;

        if (callIdRef.current === callId) {
          if (!mountedRef.current) {
            throw error;
          }

          setState({
            data: null,
            error: nextError,
            isError: true,
            isIdle: false,
            isLoading: false,
            isSuccess: false,
            status: "error",
          });
          onError?.(nextError);
        }

        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFunction, onError, onSuccess, ...deps],
  );

  const reset = useCallback(() => {
    callIdRef.current += 1;
    setState({
      data: null,
      error: null,
      isError: false,
      isIdle: true,
      isLoading: false,
      isSuccess: false,
      status: "idle",
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      void execute(...([] as unknown as TArgs));
    }
  }, [execute, immediate]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
