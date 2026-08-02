"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Maximize2,
  Minimize2,
  MousePointerClick,
  RotateCcw,
  X,
} from "lucide-react";
import type {
  LatLngBoundsExpression,
  LatLngExpression,
  Map as LeafletMap,
} from "leaflet";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { OPEN_STREET_MAP_TILE_PROVIDER } from "./map.constants";
import type {
  MapActivationMode,
  MapTileProvider,
  SharedMapInitialView,
} from "./map.types";
import { cn } from "../lib/utils";

function setMapInteractionEnabled(map: LeafletMap, enabled: boolean) {
  const handlers = [
    map.boxZoom,
    map.doubleClickZoom,
    map.dragging,
    map.keyboard,
    map.scrollWheelZoom,
    map.touchZoom,
  ];

  for (const handler of handlers) {
    if (enabled) handler.enable();
    else handler.disable();
  }
}

interface MapInteractionControllerProps {
  onInteractionChange: (enabled: boolean) => void;
}

function MapInteractionController({
  onInteractionChange,
}: MapInteractionControllerProps) {
  const map = useMap();

  useMapEvents({
    click: () => {
      setMapInteractionEnabled(map, true);
      onInteractionChange(true);
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    const disableInteraction = () => {
      setMapInteractionEnabled(map, false);
      onInteractionChange(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      disableInteraction();
    };

    container.addEventListener("mouseleave", disableInteraction);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("mouseleave", disableInteraction);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [map, onInteractionChange]);

  return null;
}

interface MapActivationControlProps {
  activateLabel: string;
  isInteractionEnabled: boolean;
  onInteractionChange: (enabled: boolean) => void;
}

function MapActivationControl({
  activateLabel,
  isInteractionEnabled,
  onInteractionChange,
}: MapActivationControlProps) {
  const map = useMap();

  const handleActivate = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMapInteractionEnabled(map, true);
    onInteractionChange(true);
  };

  return (
    <button
      type="button"
      aria-hidden={isInteractionEnabled}
      aria-label={activateLabel}
      tabIndex={isInteractionEnabled ? -1 : 0}
      className={`group absolute inset-0 z-[900] grid items-start justify-end p-3 transition-[background-color,opacity] duration-200 focus-visible:outline-none motion-reduce:transition-none sm:p-4 ${
        isInteractionEnabled
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

interface MapDeactivateControlProps {
  deactivateLabel: string;
  onInteractionChange: (enabled: boolean) => void;
}

function MapDeactivateControl({
  deactivateLabel,
  onInteractionChange,
}: MapDeactivateControlProps) {
  const map = useMap();

  const handleDeactivate = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMapInteractionEnabled(map, false);
    onInteractionChange(false);
  };

  return (
    <button
      type="button"
      aria-label={deactivateLabel}
      title={deactivateLabel}
      className="absolute right-3 top-3 z-[1000] inline-flex min-h-11 items-center gap-2 rounded-md border border-border-gray bg-white/95 px-3 text-xs font-semibold text-deep-black shadow-md transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
      onClick={handleDeactivate}
    >
      <X aria-hidden="true" className="size-4 shrink-0" />
      <span>{deactivateLabel}</span>
    </button>
  );
}

interface MapResetControlProps {
  attachFullscreen?: boolean;
  disableInteractionOnReset: boolean;
  initialBounds?: LatLngBoundsExpression;
  initialCenter?: LatLngExpression;
  initialZoom?: number;
  onInteractionChange: (enabled: boolean) => void;
  resetLabel: string;
}

function MapResetControl({
  attachFullscreen = false,
  disableInteractionOnReset,
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
    if (disableInteractionOnReset) {
      setMapInteractionEnabled(map, false);
      onInteractionChange(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={resetLabel}
      title={resetLabel}
      className={cn(
        "absolute left-2.5 top-[75px] z-[1000] grid size-[34px] place-items-center border-2 border-black/20 bg-white text-deep-black shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2",
        attachFullscreen ? "rounded-t-[4px]" : "rounded-[4px]",
      )}
      onClick={handleReset}
    >
      <RotateCcw aria-hidden="true" className="size-4" />
    </button>
  );
}

interface MapFullscreenControlProps {
  exitFullscreenLabel: string;
  fullscreenLabel: string;
  position: "left" | "right";
}

function MapFullscreenControl({
  exitFullscreenLabel,
  fullscreenLabel,
  position,
}: MapFullscreenControlProps) {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const container = map.getContainer();
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === container);
      window.requestAnimationFrame(() => map.invalidateSize());
    };

    setIsSupported(
      document.fullscreenEnabled &&
        typeof container.requestFullscreen === "function",
    );
    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [map]);

  if (!isSupported) return null;

  const handleToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    try {
      if (document.fullscreenElement === map.getContainer()) {
        await document.exitFullscreen();
      } else {
        await map.getContainer().requestFullscreen();
      }
    } catch {
      setIsFullscreen(false);
    }
  };

  const label = isFullscreen ? exitFullscreenLabel : fullscreenLabel;

  return (
    <button
      type="button"
      aria-label={isFullscreen ? exitFullscreenLabel : fullscreenLabel}
      title={label}
      className={cn(
        "absolute z-[1000] grid size-[34px] place-items-center border-2 border-black/20 bg-white text-deep-black shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2",
        position === "right"
          ? "right-2.5 top-[115px] rounded-[4px]"
          : "left-2.5 top-[109px] rounded-b-[4px] border-t-0",
      )}
      onClick={handleToggle}
    >
      {isFullscreen ? (
        <Minimize2 aria-hidden="true" className="size-4" />
      ) : (
        <Maximize2 aria-hidden="true" className="size-4" />
      )}
    </button>
  );
}

type SharedMapBaseProps = {
  activateLabel?: string;
  activationMode?: MapActivationMode;
  children?: ReactNode;
  className?: string;
  deactivateLabel?: string;
  exitFullscreenLabel?: string;
  fullscreenControlPosition?: "left" | "right";
  fullscreenLabel?: string;
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
  deactivateLabel,
  exitFullscreenLabel,
  fullscreenControlPosition = "left",
  fullscreenLabel,
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
  const [isInteractionEnabled, setIsInteractionEnabled] = useState(
    activationMode === "direct",
  );

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
      boxZoom={activationMode === "direct"}
      doubleClickZoom={activationMode === "direct"}
      dragging={activationMode === "direct"}
      keyboard={activationMode === "direct"}
      scrollWheelZoom={activationMode === "direct"}
      touchZoom={activationMode === "direct"}
      style={{
        touchAction:
          activationMode === "direct" || isInteractionEnabled
            ? "none"
            : "pan-y",
      }}
      className={cn("isolate z-0", className)}
    >
      {activationMode === "overlay" ? (
        <MapInteractionController
          onInteractionChange={setIsInteractionEnabled}
        />
      ) : null}
      {activationMode === "overlay" && activateLabel ? (
        <MapActivationControl
          activateLabel={activateLabel}
          isInteractionEnabled={isInteractionEnabled}
          onInteractionChange={setIsInteractionEnabled}
        />
      ) : null}
      {activationMode === "overlay" &&
      isInteractionEnabled &&
      deactivateLabel ? (
        <MapDeactivateControl
          deactivateLabel={deactivateLabel}
          onInteractionChange={setIsInteractionEnabled}
        />
      ) : null}
      {showResetControl && resetLabel ? (
        <MapResetControl
          attachFullscreen={Boolean(
            fullscreenLabel &&
            exitFullscreenLabel &&
            fullscreenControlPosition === "left",
          )}
          disableInteractionOnReset={activationMode === "overlay"}
          initialBounds={initialBounds}
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          resetLabel={resetLabel}
          onInteractionChange={setIsInteractionEnabled}
        />
      ) : null}
      {fullscreenLabel && exitFullscreenLabel ? (
        <MapFullscreenControl
          exitFullscreenLabel={exitFullscreenLabel}
          fullscreenLabel={fullscreenLabel}
          position={fullscreenControlPosition}
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
