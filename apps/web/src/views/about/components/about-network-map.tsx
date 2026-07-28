"use client";

import { MapPin } from "lucide-react";
import {
  SharedMap,
  useVietnamBoundary,
  VIETNAM_CENTER,
  VIETNAM_INITIAL_ZOOM,
  VietnamMapOverlay,
} from "@repo/ui/map";
import { divIcon } from "leaflet";
import { useTranslations } from "next-intl";
import { Marker, Popup } from "react-leaflet";

const dealerPinLocations = [
  {
    id: "hanoi",
    label: "Hà Nội",
    lat: 21.0285,
    lng: 105.8542,
    isMain: true,
    address: "Quận Cầu Giấy, Hà Nội",
  },
  {
    id: "haiphong",
    label: "Hải Phòng",
    lat: 20.8449,
    lng: 106.6881,
    isMain: false,
    address: "Quận Hồng Bàng, Hải Phòng",
  },
  {
    id: "danang",
    label: "Đà Nẵng",
    lat: 16.0544,
    lng: 108.2022,
    isMain: true,
    address: "Quận Hải Châu, Đà Nẵng",
  },
  {
    id: "nhatrang",
    label: "Nha Trang",
    lat: 12.2388,
    lng: 109.1967,
    isMain: false,
    address: "TP. Nha Trang, Khánh Hòa",
  },
  {
    id: "hcm",
    label: "TP. Hồ Chí Minh",
    lat: 10.7769,
    lng: 106.7009,
    isMain: true,
    address: "Quận 1, TP. Hồ Chí Minh",
  },
  {
    id: "cantho",
    label: "Cần Thơ",
    lat: 10.0452,
    lng: 105.7469,
    isMain: false,
    address: "Quận Ninh Kiều, Cần Thơ",
  },
];

export function AboutNetworkMap() {
  const t = useTranslations("AboutPage.network");
  const { boundary } = useVietnamBoundary();

  const createCustomIcon = (label: string, isMain: boolean) =>
    divIcon({
      className: "fujitek-network-marker",
      html: `
        <div class="relative group cursor-pointer flex flex-col items-center">
          <span class="absolute -inset-2 rounded-full bg-red-500/30 ${isMain ? "animate-ping" : ""} pointer-events-none"></span>
          <div class="relative size-4 rounded-full bg-premium-red border-2 border-white shadow-md flex items-center justify-center">
            <div class="size-1.5 rounded-full bg-white"></div>
          </div>
          <div class="mt-1 whitespace-nowrap opacity-95 group-hover:opacity-100 transition-opacity">
            <span class="rounded bg-deep-black/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-md">
              ${label}
            </span>
          </div>
        </div>
      `,
      iconAnchor: [30, 10],
      iconSize: [60, 40],
      popupAnchor: [0, -10],
    });

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

        {dealerPinLocations.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={createCustomIcon(pin.label, pin.isMain)}
          >
            <Popup className="fujitek-map-popup">
              <div className="p-1 space-y-1.5 min-w-[160px]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-premium-red" />
                  <span className="text-xs font-bold text-deep-black uppercase">
                    Đại lý {pin.label}
                  </span>
                </div>
                <p className="text-[11px] text-stone-gray m-0 leading-tight">
                  {pin.address}
                </p>
                <div className="pt-1 text-[10px] font-bold text-premium-red uppercase">
                  Dịch vụ E-Warranty chính hãng
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </SharedMap>
    </div>
  );
}
