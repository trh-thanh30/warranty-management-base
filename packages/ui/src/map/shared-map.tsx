"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MousePointerClick, RotateCcw } from "lucide-react";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

interface MapInteractionControllerProps {
  onInteractionChange: (enabled: boolean) => void;
}

function MapInteractionController({
  onInteractionChange,
}: MapInteractionControllerProps) {
  const map = useMap();

  useMapEvents({
    click: () => {
      map.scrollWheelZoom.enable();
      onInteractionChange(true);
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    const disableWheelZoom = () => {
      map.scrollWheelZoom.disable();
      onInteractionChange(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      disableWheelZoom();
    };

    container.addEventListener("mouseleave", disableWheelZoom);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("mouseleave", disableWheelZoom);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [map, onInteractionChange]);

  return null;
}

interface MapActivationControlProps {
  activateLabel: string;
  isWheelZoomEnabled: boolean;
  onInteractionChange: (enabled: boolean) => void;
}

function MapActivationControl({
  activateLabel,
  isWheelZoomEnabled,
  onInteractionChange,
}: MapActivationControlProps) {
  const map = useMap();

  const handleActivate = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    map.scrollWheelZoom.enable();
    onInteractionChange(true);
  };

  return (
    <button
      type="button"
      aria-hidden={isWheelZoomEnabled}
      aria-label={activateLabel}
      tabIndex={isWheelZoomEnabled ? -1 : 0}
      className={`group absolute inset-0 z-[900] grid items-start justify-end p-3 transition-[background-color,opacity] duration-200 focus-visible:outline-none motion-reduce:transition-none sm:p-4 ${
        isWheelZoomEnabled
          ? "pointer-events-none bg-transparent opacity-0"
          : "pointer-events-auto bg-transparent opacity-100"
      }`}
      onClick={handleActivate}
    >
      <span className="inline-flex min-h-11 items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-premium-red drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)] transition-opacity group-hover:opacity-100 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-premium-red">
        <MousePointerClick aria-hidden="true" className="size-3.5 shrink-0" />
        <span>{activateLabel}</span>
      </span>
    </button>
  );
}

interface MapResetControlProps {
  initialCenter: LatLngExpression;
  initialZoom: number;
  onInteractionChange: (enabled: boolean) => void;
  resetLabel: string;
}

function MapResetControl({
  initialCenter,
  initialZoom,
  onInteractionChange,
  resetLabel,
}: MapResetControlProps) {
  const map = useMap();

  const handleReset = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    map.closePopup();
    map.setView(initialCenter, initialZoom);
    map.scrollWheelZoom.disable();
    onInteractionChange(false);
  };

  return (
    <button
      type="button"
      aria-label={resetLabel}
      title={resetLabel}
      className="leaflet-control absolute left-2.5 top-[75px] z-[1000] grid size-[34px] place-items-center rounded-[4px] border-2 border-black/20 bg-white text-deep-black shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
      onClick={handleReset}
    >
      <RotateCcw aria-hidden="true" className="size-4" />
    </button>
  );
}

export interface SharedMapProps {
  activateLabel: string;
  children?: ReactNode;
  className?: string;
  initialCenter: LatLngExpression;
  initialZoom: number;
  loadingClassName?: string;
  maxZoom?: number;
  minZoom?: number;
  resetLabel: string;
  tileAttribution?: string;
  tileUrl?: string;
  zoomSnap?: number;
}

export function SharedMap({
  activateLabel,
  children,
  className = "size-full",
  initialCenter,
  initialZoom,
  loadingClassName = "size-full animate-pulse bg-surface-muted",
  maxZoom,
  minZoom,
  resetLabel,
  tileAttribution = DEFAULT_TILE_ATTRIBUTION,
  tileUrl = DEFAULT_TILE_URL,
  zoomSnap,
}: SharedMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isWheelZoomEnabled, setIsWheelZoomEnabled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div aria-hidden="true" className={loadingClassName} />;
  }

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      zoomSnap={zoomSnap}
      minZoom={minZoom}
      maxZoom={maxZoom}
      scrollWheelZoom={false}
      className={className}
    >
      <MapInteractionController onInteractionChange={setIsWheelZoomEnabled} />
      <MapActivationControl
        activateLabel={activateLabel}
        isWheelZoomEnabled={isWheelZoomEnabled}
        onInteractionChange={setIsWheelZoomEnabled}
      />
      <MapResetControl
        initialCenter={initialCenter}
        initialZoom={initialZoom}
        resetLabel={resetLabel}
        onInteractionChange={setIsWheelZoomEnabled}
      />

      <TileLayer url={tileUrl} attribution={tileAttribution} />
      {children}
    </MapContainer>
  );
}
