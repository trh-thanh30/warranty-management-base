"use client";

import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { MapPin, Navigation, Phone } from "lucide-react";
import type { DealerLocation } from "../dealers.types";

type DealerListProps = {
  activeDealerId: string | null;
  dealers: readonly DealerLocation[];
  error: boolean;
  loading: boolean;
  onRetry: () => void;
  onSelectDealer: (dealerId: string) => void;
  translations: {
    directions: string;
    empty: string;
    error: string;
    loading: string;
    retry: string;
    viewMore: string;
  };
};

function DealerListSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6 p-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="space-y-3 rounded-[20px] p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-28" />
        </div>
      ))}
    </div>
  );
}

export function DealerList({
  activeDealerId,
  dealers,
  error,
  loading,
  onRetry,
  onSelectDealer,
  translations,
}: DealerListProps) {
  if (loading) {
    return (
      <div className="flex-1 overflow-hidden" role="status">
        <span className="sr-only">{translations.loading}</span>
        <DealerListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
        role="alert"
      >
        <p className="text-sm font-medium text-stone-gray">
          {translations.error}
        </p>
        <Button
          type="button"
          onClick={onRetry}
          className="min-h-11 bg-premium-red text-white hover:bg-warm-red"
        >
          {translations.retry}
        </Button>
      </div>
    );
  }

  if (dealers.length === 0) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8 text-center text-sm font-medium text-stone-gray"
        role="status"
      >
        {translations.empty}
      </div>
    );
  }

  return (
    <div
      data-lenis-prevent
      className="min-h-0 flex-1 touch-pan-y space-y-4 divide-y divide-border-gray/60 overflow-y-auto overscroll-y-contain p-4 [scrollbar-gutter:stable]"
    >
      {dealers.map((dealer) => {
        const isSelected = activeDealerId === dealer.id;

        return (
          <article
            key={dealer.id}
            className={`space-y-3 rounded-[20px] border p-4 pt-4 transition-colors first:pt-4 ${
              isSelected
                ? "border-premium-red bg-premium-red/5"
                : "border-transparent hover:bg-surface-muted"
            }`}
          >
            <Button
              type="button"
              variant="ghost"
              aria-pressed={isSelected}
              onClick={() => onSelectDealer(dealer.id)}
              className="h-auto min-h-11 w-full items-start justify-start whitespace-normal p-0 text-left hover:bg-transparent"
            >
              <span className="w-full space-y-3">
                <span className="block text-sm font-semibold uppercase leading-snug text-deep-black sm:text-base">
                  {dealer.name}
                </span>
                <span className="block space-y-1.5 text-xs font-medium text-stone-gray">
                  <span className="flex items-start gap-2">
                    <MapPin
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-premium-red"
                    />
                    <span>{dealer.address}</span>
                  </span>
                  {dealer.phone ? (
                    <span className="flex items-center gap-2">
                      <Phone
                        aria-hidden="true"
                        className="size-4 shrink-0 text-premium-red"
                      />
                      <span className="font-medium text-deep-black">
                        {dealer.phone}
                      </span>
                    </span>
                  ) : null}
                </span>
              </span>
            </Button>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                size="sm"
                onClick={() => onSelectDealer(dealer.id)}
                className="min-h-9 rounded-[8px] bg-accent-gold text-xs font-semibold uppercase tracking-wider text-deep-black hover:bg-accent-gold-hover"
              >
                {translations.viewMore}
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="min-h-9 px-2 text-xs font-semibold uppercase text-premium-red hover:bg-premium-red/5 hover:text-premium-red"
              >
                <a
                  href={dealer.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation aria-hidden="true" className="size-3.5" />
                  <span>{translations.directions}</span>
                </a>
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
