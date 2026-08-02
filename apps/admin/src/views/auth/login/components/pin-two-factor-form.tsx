"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, PinInput } from "@repo/ui";
import {
  ADMIN_LOGIN_CHALLENGE_METHOD,
  type AdminLoginPinChallengeMethod,
} from "@repo/shared";

type PinTwoFactorFormProps = {
  mode: AdminLoginPinChallengeMethod;
  onBack: () => void;
  onSubmit: (pin: string, confirmPin?: string) => Promise<void>;
};

export function PinTwoFactorForm({
  mode,
  onBack,
  onSubmit,
}: PinTwoFactorFormProps) {
  const t = useTranslations("Login");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSetup = mode === ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP;

  useEffect(() => {
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pin.length !== 6 || (isSetup && confirmPin.length !== 6)) {
      setError(t("pinRequired"));
      return;
    }
    if (isSetup && pin !== confirmPin) {
      setError(t("pinMismatch"));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(pin, isSetup ? confirmPin : undefined);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t("pinGenericError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={submit} noValidate>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {isSetup ? t("pinCreateLabel") : t("pinVerifyLabel")}
        </p>
        <PinInput
          aria-label={isSetup ? t("pinCreateLabel") : t("pinVerifyLabel")}
          autoComplete="off"
          autoFocus
          length={6}
          onChange={setPin}
          value={pin}
        />
      </div>

      {isSetup ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("pinConfirmLabel")}
          </p>
          <PinInput
            aria-label={t("pinConfirmLabel")}
            autoComplete="off"
            length={6}
            onChange={setConfirmPin}
            value={confirmPin}
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <Button
          className="h-12 w-full rounded-lg bg-blue-500 text-base text-white hover:bg-blue-600"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck className="size-[18px]" aria-hidden="true" />
          )}
          {isSubmitting
            ? t("pinSubmitting")
            : isSetup
              ? t("pinSetupSubmit")
              : t("pinVerifySubmit")}
        </Button>
        <button
          className="mx-auto flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("methodChooseAnother")}
        </button>
      </div>
    </form>
  );
}
