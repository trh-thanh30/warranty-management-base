"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MousePointerClick, RotateCcw } from "lucide-react";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { OPEN_STREET_MAP_TILE_PROVIDER } from "./map.constants";
import type {
  MapActivationMode,
  MapTileProvider,
  SharedMapInitialView,
} from "./map.types";
import { cn } from "../lib/utils";

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
  initialBounds?: LatLngBoundsExpression;
  initialCenter?: LatLngExpression;
  initialZoom?: number;
  onInteractionChange: (enabled: boolean) => void;
  resetLabel: string;
}

function MapResetControl({
  initialBounds,
  initialCenter,
  initialZoom,
  onInteractionChange,
  resetLabel,
}: MapResetControlProps) {
  const map = useMap();

  const handleReset = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    map.closePopup();
    if (initialBounds) {
      map.fitBounds(initialBounds);
    } else if (initialCenter && initialZoom !== undefined) {
      map.setView(initialCenter, initialZoom);
    }
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

type SharedMapBaseProps = {
  activateLabel?: string;
  activationMode?: MapActivationMode;
  children?: ReactNode;
  className?: string;
  loadingClassName?: string;
  maxBounds?: LatLngBoundsExpression;
  maxBoundsViscosity?: number;
  maxZoom?: number;
  minZoom?: number;
  resetLabel?: string;
  showResetControl?: boolean;
  tileProvider?: MapTileProvider;
  zoomSnap?: number;
};

export type SharedMapProps = SharedMapBaseProps & SharedMapInitialView;

export function SharedMap({
  activateLabel,
  activationMode = "overlay",
  children,
  className = "size-full",
  initialBounds,
  initialCenter,
  initialZoom,
  loadingClassName = "size-full animate-pulse bg-surface-muted",
  maxBounds,
  maxBoundsViscosity,
  maxZoom,
  minZoom,
  resetLabel,
  showResetControl = true,
  tileProvider = OPEN_STREET_MAP_TILE_PROVIDER,
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
      bounds={initialBounds}
      center={initialCenter}
      zoom={initialZoom}
      zoomSnap={zoomSnap}
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxBounds={maxBounds}
      maxBoundsViscosity={maxBoundsViscosity}
      scrollWheelZoom={activationMode === "direct"}
      className={cn("isolate z-0", className)}
    >
      {activationMode === "overlay" ? (
        <MapInteractionController onInteractionChange={setIsWheelZoomEnabled} />
      ) : null}
      {activationMode === "overlay" && activateLabel ? (
        <MapActivationControl
          activateLabel={activateLabel}
          isWheelZoomEnabled={isWheelZoomEnabled}
          onInteractionChange={setIsWheelZoomEnabled}
        />
      ) : null}
      {showResetControl && resetLabel ? (
        <MapResetControl
          initialBounds={initialBounds}
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          resetLabel={resetLabel}
          onInteractionChange={setIsWheelZoomEnabled}
        />
      ) : null}

      <TileLayer
        url={tileProvider.url}
        attribution={tileProvider.attribution}
      />
      {children}
    </MapContainer>
  );
}
