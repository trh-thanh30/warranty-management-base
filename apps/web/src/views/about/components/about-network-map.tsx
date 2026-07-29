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
import { divIcon } from "leaflet";
import { MapPin, Navigation, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Marker, Popup, Tooltip } from "react-leaflet";
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
        <div class="relative cursor-pointer flex items-center justify-center">
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

  const locationTypeLabel = (location: PublicNetworkLocation) =>
    location.kind === "DEALER"
      ? t("locationType.dealer")
      : t("locationType.serviceCenter");

  return (
    <div className="relative w-full h-full bg-surface-muted isolate overflow-hidden">
      <SharedMap
        activateLabel={t("activateMap")}
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
            <Popup className="fujitek-map-popup">
              <div className="min-w-[190px] space-y-2 p-1">
                <div className="space-y-1">
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: markerColorByKind[location.kind] }}
                  >
                    {locationTypeLabel(location)}
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin
                      aria-hidden="true"
                      className="mt-0.5 size-3.5 shrink-0 text-premium-red"
                    />
                    <span className="text-xs font-bold text-deep-black">
                      {location.name}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-gray m-0 leading-tight">
                  {location.address}
                </p>
                {location.phone ? (
                  <a
                    href={`tel:${location.phone}`}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-deep-black hover:text-premium-red"
                  >
                    <Phone aria-hidden="true" className="size-3.5" />
                    <span>{location.phone}</span>
                  </a>
                ) : null}
                <a
                  href={location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-8 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-premium-red hover:underline"
                >
                  <Navigation aria-hidden="true" className="size-3.5" />
                  <span>{t("directions")}</span>
                </a>
              </div>
            </Popup>
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
            className="min-h-9 shrink-0 rounded bg-premium-red px-3 text-[10px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
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
