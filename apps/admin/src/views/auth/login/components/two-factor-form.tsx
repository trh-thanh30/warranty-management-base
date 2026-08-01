"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, PinInput } from "@repo/ui";
import type { AdminLoginChallengeResponse } from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";

type TwoFactorFormProps = {
  challenge: AdminLoginChallengeResponse;
  onVerify: (code: string) => Promise<void>;
  onResend: (challengeId: string) => Promise<{ expires_at: string }>;
  onBack: () => void;
};

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function TwoFactorForm({
  challenge,
  onVerify,
  onResend,
  onBack,
}: TwoFactorFormProps) {
  const t = useTranslations("Login");
  const toast = useToast();
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(() =>
    new Date(challenge.expires_at).getTime(),
  );
  const [secondsLeft, setSecondsLeft] = useState(() =>
    remainingSeconds(new Date(challenge.expires_at).getTime()),
  );
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft(remainingSeconds(expiresAt));
      setResendSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

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
    if (code.length !== CODE_LENGTH || secondsLeft <= 0) {
      setError(
        secondsLeft <= 0 ? t("twoFactorExpired") : t("twoFactorCodeRequired"),
      );
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onVerify(code);
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : t("twoFactorGenericError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resend() {
    if (resendSeconds > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      const result = await onResend(challenge.challenge_id);
      const nextExpiresAt = new Date(result.expires_at).getTime();
      setExpiresAt(nextExpiresAt);
      setSecondsLeft(remainingSeconds(nextExpiresAt));
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setCode("");
      toast.success(t("twoFactorResendSuccess"));
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : t("twoFactorGenericError"),
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={submit} noValidate>
      <PinInput
        aria-label={t("twoFactorCodeLabel")}
        autoComplete="one-time-code"
        autoFocus
        inputMode="numeric"
        length={CODE_LENGTH}
        onChange={setCode}
        value={code}
      />

      <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
        {t("twoFactorTechnicalSupport")}
      </p>

      <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
        <span
          aria-live="polite"
          className={secondsLeft <= 0 ? "text-red-600 dark:text-red-400" : ""}
        >
          {secondsLeft > 0
            ? t("twoFactorExpiresIn", { time: formatSeconds(secondsLeft) })
            : t("twoFactorExpired")}
        </span>
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950"
          disabled={resendSeconds > 0 || isResending}
          onClick={() => void resend()}
          type="button"
        >
          {isResending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          {resendSeconds > 0
            ? t("twoFactorResendIn", { seconds: resendSeconds })
            : t("twoFactorResend")}
        </button>
      </div>

      {error ? (
        <p
          aria-live="assertive"
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <Button
          className="h-12 w-full rounded-lg bg-blue-500 text-base text-white hover:bg-blue-600 focus-visible:ring-blue-500 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          disabled={isSubmitting || secondsLeft <= 0}
          type="submit"
        >
          {isSubmitting ? (
            <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck className="size-[18px]" aria-hidden="true" />
          )}
          {isSubmitting ? t("twoFactorVerifying") : t("twoFactorVerify")}
        </Button>
        <button
          className="mx-auto flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("twoFactorUseDifferentAccount")}
        </button>
      </div>
    </form>
  );
}

function remainingSeconds(expiresAt: number) {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}
