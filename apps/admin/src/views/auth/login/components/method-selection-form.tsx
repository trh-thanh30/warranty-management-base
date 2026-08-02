"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight, KeyRound, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ADMIN_TWO_FACTOR_METHOD,
  type AdminLoginStartResponse,
  type AdminTwoFactorMethod,
} from "@repo/shared";

type MethodSelectionFormProps = {
  challenge: AdminLoginStartResponse;
  onBack: () => void;
  onSelect: (method: AdminTwoFactorMethod) => Promise<void>;
};

export function MethodSelectionForm({
  challenge,
  onBack,
  onSelect,
}: MethodSelectionFormProps) {
  const t = useTranslations("Login");
  const [pendingMethod, setPendingMethod] =
    useState<AdminTwoFactorMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const methods = [...challenge.available_methods].sort((left, right) => {
    if (left === challenge.recommended_method) return -1;
    if (right === challenge.recommended_method) return 1;
    return 0;
  });

  async function select(method: AdminTwoFactorMethod) {
    if (pendingMethod) return;
    setPendingMethod(method);
    setError(null);
    try {
      await onSelect(method);
    } catch (selectionError) {
      setError(
        selectionError instanceof Error
          ? selectionError.message
          : t("methodSelectionError"),
      );
      setPendingMethod(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3" role="list">
        {methods.map((method) => {
          const isEmail = method === ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP;
          const isPending = pendingMethod === method;
          const Icon = isEmail ? Mail : KeyRound;
          const title = isEmail
            ? t("methodEmailTitle")
            : challenge.pin_configured
              ? t("methodPinTitle")
              : t("methodPinSetupTitle");
          const description = isEmail
            ? t("methodEmailDescription", {
                email: challenge.masked_destination,
              })
            : challenge.pin_configured
              ? t("methodPinDescription")
              : t("methodPinSetupDescription");

          return (
            <button
              className="group flex min-h-[76px] w-full cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left outline-none transition-[border-color,background-color,box-shadow] hover:border-blue-300 hover:bg-blue-50/50 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-400/15"
              disabled={pendingMethod !== null}
              key={method}
              onClick={() => void select(method)}
              role="listitem"
              type="button"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-blue-900 dark:group-hover:text-blue-300">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-950 dark:text-white">
                  {title}
                </span>
                <span className="mt-0.5 block text-sm leading-5 text-slate-600 dark:text-slate-400">
                  {description}
                </span>
              </span>
              {isPending ? (
                <Loader2
                  className="size-5 shrink-0 animate-spin text-blue-600 dark:text-blue-300"
                  aria-hidden="true"
                />
              ) : (
                <ChevronRight
                  className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-300"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="mx-auto flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        disabled={pendingMethod !== null}
        onClick={onBack}
        type="button"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("methodUseDifferentAccount")}
      </button>
    </div>
  );
}
