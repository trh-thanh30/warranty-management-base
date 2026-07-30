"use client";

import { Container } from "@/src/components/common/container";
import { useWarrantyClaimTracking } from "@/src/hooks/use-warranty-claim-tracking";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { WarrantyClaimProgress } from "./components/warranty-claim-progress";
import { WarrantyTrackForm } from "./components/warranty-track-form";

export function WarrantyTrackView() {
  const t = useTranslations("Warranty.track");
  const searchParams = useSearchParams();
  const { data, isPending, track } = useWarrantyClaimTracking();
  const initialClaimCode = searchParams.get("claimCode") ?? "";

  return (
    <main className="min-h-screen bg-surface-muted py-12 text-deep-black sm:py-20">
      <Container className="max-w-250 space-y-10">
        <header className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-sm font-semibold uppercase text-premium-red">
            {t("eyebrow")}
          </p>
          <h1 className="font-condensed text-3xl font-semibold uppercase sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-base text-stone-gray sm:text-lg">
            {t("description")}
          </p>
        </header>

        <section className="mx-auto max-w-2xl rounded-md border border-border-gray bg-white p-5 shadow-sm sm:p-8">
          <WarrantyTrackForm
            initialValue={initialClaimCode}
            isPending={isPending}
            onSubmit={track}
          />
        </section>

        {data ? <WarrantyClaimProgress claim={data} /> : null}
      </Container>
    </main>
  );
}
