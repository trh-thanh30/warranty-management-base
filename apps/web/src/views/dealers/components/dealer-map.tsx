"use client";

import type {
  PublicNetworkLocation,
  PublicNetworkLocationKind,
} from "@repo/shared";
import {
  MAP_MARKER_COLORS,
  SharedMap,
  useVietnamBoundary,
  VIETNAM_CENTER,
  VIETNAM_INITIAL_ZOOM,
  VietnamMapOverlay,
} from "@repo/ui/map";
import { Button } from "@repo/ui/button";
import { divIcon } from "leaflet";
import { ExternalLink, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { Marker, Popup, Tooltip, useMap } from "react-leaflet";
import { useNetworkLocations } from "@/src/hooks/use-network-locations";
import type { NetworkDirectoryLocation } from "../dealers.types";

interface DealerMapProps {
  activeLocation: NetworkDirectoryLocation | null;
}

const markerColorByKind: Record<PublicNetworkLocationKind, string> = {
  DEALER: MAP_MARKER_COLORS.dealer,
  SERVICE_CENTER: MAP_MARKER_COLORS.serviceCenter,
};

function createLocationIcon(kind: PublicNetworkLocationKind, selected = false) {
  const size = selected ? 38 : 28;
  const coreSize = selected ? 22 : 16;
  const color = markerColorByKind[kind];

  return divIcon({
    className: "fujitek-network-marker",
    html: `
      <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer">
        <span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:${selected ? 0.25 : 0.18}"></span>
        <span style="position:relative;width:${coreSize}px;height:${coreSize}px;border-radius:9999px;border:3px solid white;background:${color};box-shadow:0 2px 8px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center">
          <span style="width:5px;height:5px;border-radius:9999px;background:white"></span>
        </span>
      </div>
    `,
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size],
    popupAnchor: [0, -(size / 2)],
  });
}

function MapCamera({ activeLocation }: DealerMapProps) {
  const map = useMap();

  useEffect(() => {
    if (activeLocation) {
      map.flyTo([activeLocation.latitude, activeLocation.longitude], 13, {
        duration: 1.1,
      });
      return;
    }

    map.setView(VIETNAM_CENTER, VIETNAM_INITIAL_ZOOM, { animate: true });
  }, [activeLocation, map]);

  return null;
}

export function DealerMap({ activeLocation }: DealerMapProps) {
  const t = useTranslations("DealersPage.map");
  const { boundary, status } = useVietnamBoundary();
  const {
    error: locationsError,
    loading: locationsLoading,
    locations,
    retry,
  } = useNetworkLocations();
  const markerIcons = useMemo(
    () => ({
      DEALER: createLocationIcon("DEALER"),
      SERVICE_CENTER: createLocationIcon("SERVICE_CENTER"),
      selectedDealer: createLocationIcon("DEALER", true),
      selectedServiceCenter: createLocationIcon("SERVICE_CENTER", true),
    }),
    [],
  );
  const locationTypeLabel = (location: PublicNetworkLocation) =>
    location.kind === "DEALER"
      ? t("locationType.dealer")
      : t("locationType.serviceCenter");

  return (
    <div
      role="region"
      aria-label={t("ariaLabel")}
      className="relative isolate size-full overflow-hidden bg-surface-muted"
    >
      <SharedMap
        activateLabel={t("activateMap")}
        initialCenter={VIETNAM_CENTER}
        initialZoom={VIETNAM_INITIAL_ZOOM}
        className="size-full"
        minZoom={5}
        maxZoom={18}
        resetLabel={t("resetMap")}
        zoomSnap={0.25}
      >
        {boundary ? (
          <VietnamMapOverlay
            boundary={boundary}
            maskFillColor="var(--color-surface-muted)"
            maskFillOpacity={1}
            outlineColor="var(--color-premium-red)"
            outlineOpacity={0.75}
            outlineWeight={1}
          />
        ) : null}

        <MapCamera activeLocation={activeLocation} />

        {locations.map((location) => {
          const isSelectedLocation =
            activeLocation !== null &&
            location.kind === activeLocation.kind &&
            location.id === activeLocation.id;

          return (
            <Marker
              key={`${location.kind}-${location.id}`}
              position={[location.latitude, location.longitude]}
              icon={
                isSelectedLocation
                  ? location.kind === "DEALER"
                    ? markerIcons.selectedDealer
                    : markerIcons.selectedServiceCenter
                  : markerIcons[location.kind]
              }
              title={location.name}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                {location.name}
              </Tooltip>
              <Popup>
                <div className="min-w-52 space-y-2">
                  <span
                    className="inline-flex rounded-sm px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white"
                    style={{
                      backgroundColor: markerColorByKind[location.kind],
                    }}
                  >
                    {locationTypeLabel(location)}
                  </span>
                  <p className="m-0 text-sm font-semibold uppercase leading-snug text-deep-black">
                    {location.name}
                  </p>
                  <p className="m-0 text-xs leading-relaxed text-stone-gray">
                    {location.address}
                  </p>
                  {location.phone ? (
                    <a
                      href={`tel:${location.phone}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-deep-black hover:text-premium-red"
                    >
                      <Phone
                        aria-hidden="true"
                        className="size-3.5 text-premium-red"
                      />
                      <span>
                        {t("popupPhone")}: {location.phone}
                      </span>
                    </a>
                  ) : null}
                  <a
                    href={location.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-premium-red hover:underline"
                  >
                    <span>{t("openGoogleMaps")}</span>
                    <ExternalLink aria-hidden="true" className="size-3" />
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </SharedMap>

      {(!boundary || locationsLoading) && !locationsError ? (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-4 top-4 z-[500] rounded-xl border border-border-gray bg-white/95 px-4 py-3 text-center text-xs font-medium text-stone-gray shadow-md backdrop-blur-sm"
        >
          {status === "error"
            ? t("loadError")
            : locationsLoading
              ? t("networkLoading")
              : t("loading")}
        </div>
      ) : null}

      {locationsError ? (
        <div
          role="alert"
          className="absolute inset-x-4 top-4 z-[500] flex items-center justify-between gap-3 rounded-sm border border-premium-red/30 bg-white/95 px-4 py-3 text-xs font-semibold text-deep-black shadow-md"
        >
          <span>{t("networkError")}</span>
          <Button
            type="button"
            size="sm"
            onClick={retry}
            className="min-h-9 shrink-0 rounded-sm bg-premium-red px-3 text-xs font-semibold uppercase text-white transition-colors hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
          >
            {t("retry")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
