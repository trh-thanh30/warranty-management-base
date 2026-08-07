"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UpdateWarrantyBody, WarrantyListItem } from "@repo/shared";
import { HttpClientError } from "@repo/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from "@repo/ui";
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { FormField } from "@/src/components/common/form-field";
import { VndInput } from "@/src/components/common/vnd-input";
import { useToast } from "@/src/hooks/use-toast";
import { useUpdateWarranty } from "@/src/hooks/use-warranties";
import { useRouter } from "@/src/i18n/navigation";
import {
  isEmptyRichText,
  stripHtml,
  toNullableRichText,
} from "@/src/utils/rich-text";
import {
  isValidWarrantyAmount,
  isValidWarrantyDuration,
} from "../warranties.utils";

type WarrantyEditFormCardProps = {
  warranty: WarrantyListItem;
};

export function WarrantyEditFormCard({ warranty }: WarrantyEditFormCardProps) {
  const t = useTranslations("Warranties");
  const router = useRouter();
  const toast = useToast();
  const updateWarranty = useUpdateWarranty(warranty.id);
  const [durationMonths, setDurationMonths] = useState(
    String(warranty.durationMonths),
  );
  const [coverageLimitAmount, setCoverageLimitAmount] = useState(
    warranty.coverageLimitAmount ?? "",
  );
  const [maxClaimCount, setMaxClaimCount] = useState(
    warranty.maxClaimCount === null ? "" : String(warranty.maxClaimCount),
  );
  const [maxAmountPerClaim, setMaxAmountPerClaim] = useState(
    warranty.maxAmountPerClaim ?? "",
  );
  const [terms, setTerms] = useState(warranty.terms ?? "");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const detailHref = `/warranties/${warranty.id}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = buildUpdateBody();
    if (!body) return;

    try {
      await updateWarranty.mutateAsync(body);
      toast.success(t("updateSuccess"));
      router.push(detailHref);
    } catch (error) {
      const message =
        error instanceof HttpClientError && error.status === 404
          ? t("notFound")
          : t("updateError");
      setFormError(message);
      toast.error(message);
    }
  }

  function buildUpdateBody(): UpdateWarrantyBody | null {
    const duration = Number(durationMonths);
    const claimCount = maxClaimCount.trim() ? Number(maxClaimCount) : null;
    const coverage = coverageLimitAmount.trim() || null;
    const perClaim = maxAmountPerClaim.trim() || null;

    if (
      isEmptyRichText(adjustmentReason) ||
      stripHtml(adjustmentReason).length < 3
    ) {
      setFormError(t("adjustmentReasonRequired"));
      return null;
    }
    if (!isValidWarrantyDuration(duration)) {
      setFormError(t("durationInvalid"));
      return null;
    }
    if (
      claimCount !== null &&
      (!Number.isInteger(claimCount) || claimCount < 1 || claimCount > 1000)
    ) {
      setFormError(t("maxClaimCountInvalid"));
      return null;
    }
    if (!isValidWarrantyAmount(coverage) || !isValidWarrantyAmount(perClaim)) {
      setFormError(t("amountInvalid"));
      return null;
    }
    if (
      coverage !== null &&
      perClaim !== null &&
      Number(perClaim) > Number(coverage)
    ) {
      setFormError(t("perClaimExceedsCoverage"));
      return null;
    }

    setFormError(null);
    return {
      adjustmentReason: adjustmentReason.trim(),
      coverageLimitAmount: coverage,
      durationMonths: duration,
      maxAmountPerClaim: perClaim,
      maxClaimCount: claimCount,
      terms: toNullableRichText(terms),
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("editTitle")}</CardTitle>
        <CardDescription>
          {t("editDescription", { code: warranty.warrantyCode ?? "-" })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="edit-warranty-duration" label={t("durationMonths")}>
              <Input
                id="edit-warranty-duration"
                min={1}
                onChange={(event) => setDurationMonths(event.target.value)}
                required
                type="number"
                value={durationMonths}
              />
            </FormField>
            <FormField id="edit-warranty-max-claims" label={t("maxClaimCount")}>
              <Input
                id="edit-warranty-max-claims"
                max={1000}
                min={1}
                onChange={(event) => setMaxClaimCount(event.target.value)}
                placeholder={t("unlimited")}
                type="number"
                value={maxClaimCount}
              />
            </FormField>
            <FormField
              id="edit-warranty-coverage-limit"
              label={t("coverageLimitAmount")}
            >
              <VndInput
                id="edit-warranty-coverage-limit"
                onValueChange={setCoverageLimitAmount}
                placeholder={t("unlimited")}
                value={coverageLimitAmount}
              />
            </FormField>
            <FormField
              id="edit-warranty-per-claim"
              label={t("maxAmountPerClaim")}
            >
              <VndInput
                id="edit-warranty-per-claim"
                onValueChange={setMaxAmountPerClaim}
                placeholder={t("unlimited")}
                value={maxAmountPerClaim}
              />
            </FormField>
          </div>

          <div className="space-y-2">
            <Label>{t("terms")}</Label>
            <RichTextEditor
              disabled={updateWarranty.isPending}
              onChange={setTerms}
              value={terms}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("adjustmentReason")}</Label>
            <RichTextEditor
              disabled={updateWarranty.isPending}
              onChange={setAdjustmentReason}
              value={adjustmentReason}
            />
          </div>

          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
            <Button
              disabled={updateWarranty.isPending}
              onClick={() => router.push(detailHref)}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button disabled={updateWarranty.isPending} type="submit">
              {updateWarranty.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {updateWarranty.isPending ? t("updating") : t("saveChanges")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function WarrantyEditFormSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-16 w-full" key={index} />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}
