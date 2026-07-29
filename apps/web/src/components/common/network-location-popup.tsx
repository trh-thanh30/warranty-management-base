import type { PublicNetworkLocation } from "@repo/shared";
import { Badge } from "@repo/ui/badge";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { Popup } from "react-leaflet";

interface NetworkLocationPopupTranslations {
  dealer: string;
  serviceCenter: string;
  phone: string;
  directions: string;
}

interface NetworkLocationPopupProps {
  location: PublicNetworkLocation;
  translations: NetworkLocationPopupTranslations;
}

export function NetworkLocationPopup({
  location,
  translations,
}: NetworkLocationPopupProps) {
  const isDealer = location.kind === "DEALER";

  return (
    <Popup className="fujitek-map-popup">
      <div className="min-w-56 max-w-72 space-y-3 p-1">
        <Badge
          className={`rounded-sm px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white ${
            isDealer ? "bg-premium-red" : "bg-service-center"
          }`}
        >
          {isDealer ? translations.dealer : translations.serviceCenter}
        </Badge>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <MapPin
              aria-hidden="true"
              className={`mt-0.5 size-4 shrink-0 ${
                isDealer ? "text-premium-red" : "text-service-center"
              }`}
            />
            <h3 className="m-0 text-sm font-bold uppercase leading-snug text-deep-black">
              {location.name}
            </h3>
          </div>
          <p className="m-0 text-xs leading-relaxed text-stone-gray">
            {location.address}
          </p>
        </div>

        {location.phone ? (
          <a
            href={`tel:${location.phone}`}
            className="flex min-h-8 items-center gap-2 text-xs font-semibold text-deep-black transition-colors hover:text-premium-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
          >
            <Phone
              aria-hidden="true"
              className="size-4 shrink-0 text-premium-red"
            />
            <span>
              {translations.phone}: {location.phone}
            </span>
          </a>
        ) : null}

        <a
          href={location.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold uppercase text-premium-red transition-colors hover:text-warm-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
        >
          <span>{translations.directions}</span>
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </Popup>
  );
}
