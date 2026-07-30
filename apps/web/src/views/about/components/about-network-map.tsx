"use client";

import type { PublicNetworkLocationKind } from "@repo/shared";
import {
  MAP_MARKER_COLORS,
  SharedMap,
  useVietnamBoundary,
  VIETNAM_CENTER,
  VIETNAM_INITIAL_ZOOM,
  VietnamMapOverlay,
} from "@repo/ui/map";
import { divIcon } from "leaflet";
import { useTranslations } from "next-intl";
import { Marker, Tooltip } from "react-leaflet";
import { NetworkLocationPopup } from "@/src/components/common/network-location-popup";
import { useNetworkLocations } from "@/src/hooks/use-network-locations";

const markerColorByKind: Record<PublicNetworkLocationKind, string> = {
  DEALER: MAP_MARKER_COLORS.dealer,
  SERVICE_CENTER: MAP_MARKER_COLORS.serviceCenter,
};

export function AboutNetworkMap() {
  const t = useTranslations("AboutPage.network");
  const { boundary } = useVietnamBoundary();
  const { error, loading, locations, retry } = useNetworkLocations();

  const createCustomIcon = (kind: PublicNetworkLocationKind) =>
    divIcon({
      className: "fujitek-network-marker",
      html: `
        <div class="relative size-7 cursor-pointer flex items-center justify-center">
          <span class="fujitek-network-marker-pulse" style="--marker-color: ${markerColorByKind[kind]}"></span>
          <span class="absolute size-7 rounded-full opacity-20 pointer-events-none" style="background-color: ${markerColorByKind[kind]}"></span>
          <div class="relative size-4 rounded-full border-2 border-white shadow-md flex items-center justify-center" style="background-color: ${markerColorByKind[kind]}">
            <div class="size-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconAnchor: [14, 14],
      iconSize: [28, 28],
      popupAnchor: [0, -14],
    });

  return (
    <div className="relative w-full h-full bg-surface-muted isolate overflow-hidden">
      <SharedMap
        activateLabel={t("activateMap")}
        exitFullscreenLabel={t("exitFullscreenMap")}
        fullscreenLabel={t("fullscreenMap")}
        initialCenter={VIETNAM_CENTER}
        initialZoom={VIETNAM_INITIAL_ZOOM}
        resetLabel={t("resetMap")}
        zoomSnap={0.25}
        minZoom={5}
        maxZoom={12}
        className="w-full h-full z-0"
        loadingClassName="w-full h-full min-h-[500px] animate-pulse bg-surface-muted"
      >
        {boundary ? <VietnamMapOverlay boundary={boundary} /> : null}

        {locations.map((location) => (
          <Marker
            key={`${location.kind}-${location.id}`}
            position={[location.latitude, location.longitude]}
            icon={createCustomIcon(location.kind)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              {location.name}
            </Tooltip>
            <NetworkLocationPopup
              location={location}
              translations={{
                dealer: t("locationType.dealer"),
                serviceCenter: t("locationType.serviceCenter"),
                phone: t("phone"),
                directions: t("directions"),
              }}
            />
          </Marker>
        ))}
      </SharedMap>

      <div className="pointer-events-none absolute bottom-8 left-3 z-500 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 rounded bg-white/95 px-2.5 py-1.5 text-xs font-semibold uppercase  text-deep-black shadow-md">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{ backgroundColor: MAP_MARKER_COLORS.dealer }}
          />
          {t("legendDealer")}
        </div>
        <div className="flex items-center gap-2 rounded bg-white/95 px-2.5 py-1.5 text-xs font-semibold uppercase  text-deep-black shadow-md">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{ backgroundColor: MAP_MARKER_COLORS.serviceCenter }}
          />
          {t("legendCenter")}
        </div>
      </div>

      {loading ? (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-4 top-4 z-[500] rounded-md border border-border-gray bg-white/95 px-4 py-3 text-center text-xs font-semibold text-stone-gray shadow-md"
        >
          {t("loading")}
        </div>
      ) : null}

      {!loading && error ? (
        <div
          role="alert"
          className="absolute inset-x-4 top-4 z-[500] flex items-center justify-between gap-3 rounded-md border border-premium-red/30 bg-white/95 px-4 py-3 text-xs font-semibold text-deep-black shadow-md"
        >
          <span>{t("error")}</span>
          <button
            type="button"
            onClick={retry}
            className="min-h-9 shrink-0 rounded bg-premium-red px-3 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
          >
            {t("retry")}
          </button>
        </div>
      ) : null}

      {!loading && !error && locations.length === 0 ? (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-4 top-4 z-[500] rounded-md border border-border-gray bg-white/95 px-4 py-3 text-center text-xs font-semibold text-stone-gray shadow-md"
        >
          {t("empty")}
        </div>
      ) : null}
    </div>
  );
}
