"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  SharedMap,
  useVietnamBoundary,
  VIETNAM_INTERACTION_BOUNDS,
  VIETNAM_MAINLAND_BOUNDS,
  VietnamMapOverlay,
} from "@repo/ui/map";
import { divIcon } from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";
import type { DealerLocation } from "../dealers.types";

interface DealerMapProps {
  activeDealer: DealerLocation | null;
}

function MapCamera({ activeDealer }: DealerMapProps) {
  const map = useMap();

  useEffect(() => {
    if (activeDealer) {
      map.flyTo([activeDealer.latitude, activeDealer.longitude], 13, {
        duration: 1.1,
      });
      return;
    }

    map.fitBounds(VIETNAM_MAINLAND_BOUNDS, {
      animate: true,
      padding: [24, 24],
    });
  }, [activeDealer, map]);

  return null;
}

export function DealerMap({ activeDealer }: DealerMapProps) {
  const t = useTranslations("DealersPage.map");
  const [isMounted, setIsMounted] = useState(false);
  const { boundary, status } = useVietnamBoundary();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dealerIcon = useMemo(
    () =>
      divIcon({
        className: "fujitek-dealer-marker",
        html: `
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 1.5C9.51 1.5 1 10.01 1 20.5C1 34.75 20 46.5 20 46.5C20 46.5 39 34.75 39 20.5C39 10.01 30.49 1.5 20 1.5Z" fill="var(--color-premium-red)" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20.5" r="7" fill="white"/>
          </svg>
        `,
        iconAnchor: [20, 46],
        iconSize: [40, 48],
        popupAnchor: [0, -42],
      }),
    [],
  );

  if (!isMounted) {
    return (
      <div
        aria-hidden="true"
        className="size-full animate-pulse bg-surface-muted"
      />
    );
  }

  return (
    <div
      role="region"
      aria-label={t("ariaLabel")}
      className="relative isolate size-full overflow-hidden bg-surface-muted"
    >
      <SharedMap
        activationMode="direct"
        initialBounds={VIETNAM_MAINLAND_BOUNDS}
        className="size-full"
        maxBounds={VIETNAM_INTERACTION_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={5}
        maxZoom={18}
        showResetControl={false}
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

        <MapCamera activeDealer={activeDealer} />

        {activeDealer && (
          <Marker
            position={[activeDealer.latitude, activeDealer.longitude]}
            icon={dealerIcon}
            title={activeDealer.name}
          >
            <Popup>
              <div className="min-w-52 space-y-2">
                <span className="inline-flex rounded-md bg-premium-red px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  {t("selectedDealer")}
                </span>
                <p className="m-0 text-sm font-semibold uppercase leading-snug text-deep-black">
                  {activeDealer.name}
                </p>
                <p className="m-0 text-xs leading-relaxed text-stone-gray">
                  {activeDealer.address}
                </p>
                {activeDealer.phone ? (
                  <a
                    href={`tel:${activeDealer.phone}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-deep-black hover:text-premium-red"
                  >
                    <Phone className="size-3.5 text-premium-red" />
                    <span>
                      {t("popupPhone")}: {activeDealer.phone}
                    </span>
                  </a>
                ) : null}
                <a
                  href={activeDealer.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-premium-red hover:underline"
                >
                  <span>{t("openGoogleMaps")}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </Popup>
          </Marker>
        )}
      </SharedMap>

      {!boundary && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-4 top-4 z-[500] rounded-xl border border-border-gray bg-white/95 px-4 py-3 text-center text-xs font-medium text-stone-gray shadow-md backdrop-blur-sm"
        >
          {status === "error" ? t("loadError") : t("loading")}
        </div>
      )}
    </div>
  );
}
