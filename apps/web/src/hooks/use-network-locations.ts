"use client";

import type { PublicNetworkLocation } from "@repo/shared";
import { useCallback, useEffect, useState } from "react";
import { networkLocationsService } from "@/src/services/network-locations/network-locations.service";

type NetworkLocationsState = {
  error: boolean;
  loading: boolean;
  locations: PublicNetworkLocation[];
};

const initialState: NetworkLocationsState = {
  error: false,
  loading: true,
  locations: [],
};

export function useNetworkLocations() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState<NetworkLocationsState>(initialState);

  useEffect(() => {
    let cancelled = false;

    setState((current) => ({
      ...current,
      error: false,
      loading: true,
    }));

    void networkLocationsService
      .listNetworkLocations()
      .then((locations) => {
        if (!cancelled) {
          setState({ error: false, loading: false, locations });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            error: true,
            loading: false,
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestVersion]);

  const retry = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  return { ...state, retry };
}
