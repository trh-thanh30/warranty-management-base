import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type Serializer<TValue> = {
  deserialize?: (value: string) => TValue;
  serialize?: (value: TValue) => string;
};

export type UseLocalStorageOptions<TValue> = Serializer<TValue> & {
  initializeWithValue?: boolean;
};

function getInitialValue<TValue>(
  key: string,
  initialValue: TValue | (() => TValue),
  options: UseLocalStorageOptions<TValue>,
) {
  const fallbackValue =
    initialValue instanceof Function ? initialValue() : initialValue;

  if (typeof window === "undefined" || options.initializeWithValue === false) {
    return fallbackValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return fallbackValue;
    }
    return options.deserialize
      ? options.deserialize(item)
      : (JSON.parse(item) as TValue);
  } catch {
    return fallbackValue;
  }
}

export function useLocalStorage<TValue>(
  key: string,
  initialValue: TValue | (() => TValue),
  options: UseLocalStorageOptions<TValue> = {},
): [TValue, Dispatch<SetStateAction<TValue>>, () => void] {
  const { deserialize, initializeWithValue, serialize } = options;
  const [storedValue, setStoredValue] = useState<TValue>(() =>
    getInitialValue(key, initialValue, options),
  );

  const setValue: Dispatch<SetStateAction<TValue>> = useCallback(
    (value) => {
      setStoredValue((currentValue) => {
        const nextValue =
          value instanceof Function ? value(currentValue) : value;

        if (typeof window !== "undefined") {
          try {
            const serializedValue = serialize
              ? serialize(nextValue)
              : JSON.stringify(nextValue);
            window.localStorage.setItem(key, serializedValue);
          } catch {
            // Ignore storage errors so UI state remains usable in private mode.
          }
        }

        return nextValue;
      });
    },
    [key, serialize],
  );

  const removeValue = useCallback(() => {
    setStoredValue(
      initialValue instanceof Function ? initialValue() : initialValue,
    );

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  }, [initialValue, key]);

  useEffect(() => {
    setStoredValue(
      getInitialValue(key, initialValue, {
        deserialize,
        initializeWithValue,
        serialize,
      }),
    );
  }, [deserialize, initialValue, initializeWithValue, key, serialize]);

  return [storedValue, setValue, removeValue];
}
