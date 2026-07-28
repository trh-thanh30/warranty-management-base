"use client";

import { useMemo } from "react";
import { SharedMap } from "@repo/ui/map";
import { divIcon } from "leaflet";
import { Marker } from "react-leaflet";

interface ContactMapProps {
  lat: number;
  lng: number;
  title: string;
}

export default function ContactMap({ lat, lng, title }: ContactMapProps) {
  const redPinIcon = useMemo(
    () =>
      divIcon({
        className: "fujitek-dealer-marker",
        html: `
          <svg width="36" height="44" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 1.5C9.51 1.5 1 10.01 1 20.5C1 34.75 20 46.5 20 46.5C20 46.5 39 34.75 39 20.5C39 10.01 30.49 1.5 20 1.5Z" fill="#DB2114" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20.5" r="7" fill="white"/>
          </svg>
        `,
        iconAnchor: [18, 42],
        iconSize: [36, 44],
      }),
    [],
  );

  return (
    <div className="relative isolate size-full overflow-hidden rounded-[24px]">
      <SharedMap
        activationMode="disabled"
        className="size-full"
        initialCenter={[lat, lng]}
        initialZoom={15}
        showResetControl={false}
      >
        <Marker position={[lat, lng]} icon={redPinIcon} title={title} />
      </SharedMap>
    </div>
  );
}
