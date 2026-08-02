"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import {
  adminLoginSchema,
  ADMIN_LOGIN_CHALLENGE_METHOD,
  ADMIN_TWO_FACTOR_METHOD,
  HttpClientError,
  type AdminLoginChallengeResponse,
  type AdminLoginInput,
  type AdminLoginStartResponse,
} from "@repo/shared";
import { Button, Input, Label } from "@repo/ui";
import { useAuth } from "@/src/app/providers/auth-provider";
import { consumeAuthRedirectReason } from "@/src/app/stores/auth-session.store";
import { useRouter } from "@/src/i18n/navigation";
import { useToast } from "@/src/hooks/use-toast";
import { TwoFactorForm } from "./two-factor-form";
import { PinTwoFactorForm } from "./pin-two-factor-form";
import { MethodSelectionForm } from "./method-selection-form";
import type { LoginFlowState } from "../login.types";

type LoginFormProps = {
  onFlowChange?: (state: LoginFlowState) => void;
};

export function LoginForm({ onFlowChange }: LoginFormProps) {
  const t = useTranslations("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginChallenge, setLoginChallenge] =
    useState<AdminLoginStartResponse | null>(null);
  const [verificationChallenge, setVerificationChallenge] =
    useState<AdminLoginChallengeResponse | null>(null);
  const [lastVerificationChallenge, setLastVerificationChallenge] =
    useState<AdminLoginChallengeResponse | null>(null);
  const {
    login,
    resendTwoFactor,
    selectTwoFactorMethod,
    setupPin,
    verifyPin,
    verifyTwoFactor,
  } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  useEffect(() => {
    if (consumeAuthRedirectReason() === "session-expired") {
      toast.error(t("sessionExpired"));
    }
  }, [t, toast]);

  async function submit(values: AdminLoginInput) {
    try {
      const nextChallenge = await login(values);
      setLoginChallenge(nextChallenge);
      onFlowChange?.({ step: "METHOD_SELECTION", challenge: nextChallenge });
    } catch (error) {
      toast.error(
        error instanceof HttpClientError ? error.message : t("genericError"),
      );
    }
  }

  if (verificationChallenge) {
    if (
      verificationChallenge.method !== ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP
    ) {
      return (
        <PinTwoFactorForm
          mode={verificationChallenge.method}
          onBack={() => {
            setVerificationChallenge(null);
            if (loginChallenge) {
              onFlowChange?.({
                step: "METHOD_SELECTION",
                challenge: loginChallenge,
              });
            }
          }}
          onSubmit={async (pin, confirmPin) => {
            if (
              verificationChallenge.method ===
              ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP
            ) {
              await setupPin(
                verificationChallenge.challenge_id,
                pin,
                confirmPin ?? "",
              );
            } else {
              await verifyPin(verificationChallenge.challenge_id, pin);
            }
            toast.success(t("loginSuccess"));
            router.replace("/dashboard");
          }}
        />
      );
    }
    return (
      <TwoFactorForm
        challenge={verificationChallenge}
        onBack={() => {
          setVerificationChallenge(null);
          if (loginChallenge) {
            onFlowChange?.({
              step: "METHOD_SELECTION",
              challenge: loginChallenge,
            });
          }
        }}
        onResend={resendTwoFactor}
        onVerify={async (code) => {
          await verifyTwoFactor(verificationChallenge.challenge_id, code);
          toast.success(t("loginSuccess"));
          router.replace("/dashboard");
        }}
      />
    );
  }

  if (loginChallenge) {
    return (
      <MethodSelectionForm
        challenge={loginChallenge}
        onBack={() => {
          setLoginChallenge(null);
          setLastVerificationChallenge(null);
          onFlowChange?.(null);
        }}
        onSelect={async (method) => {
          const reusesCurrentMethod =
            lastVerificationChallenge &&
            ((method === ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP &&
              lastVerificationChallenge.method ===
                ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP) ||
              (method === ADMIN_TWO_FACTOR_METHOD.PIN &&
                lastVerificationChallenge.method !==
                  ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP));
          if (reusesCurrentMethod) {
            setVerificationChallenge(lastVerificationChallenge);
            onFlowChange?.({
              step: "VERIFICATION",
              challenge: lastVerificationChallenge,
            });
            return;
          }

          const selected = await selectTwoFactorMethod(
            loginChallenge.challenge_id,
            method,
          );
          setVerificationChallenge(selected);
          setLastVerificationChallenge(selected);
          onFlowChange?.({ step: "VERIFICATION", challenge: selected });
          if (selected.method === ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP) {
            toast.success(t("twoFactorSent"));
          }
        }}
      />
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="usernameOrEmail">{t("usernameLabel")}</Label>
        <div className="relative">
          <UserRound
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
          />
          <Input
            autoComplete="username"
            className="h-12 rounded-lg border-slate-300 pl-11 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-blue-400 dark:focus:ring-blue-400/15"
            id="usernameOrEmail"
            placeholder={t("usernamePlaceholder")}
            aria-invalid={Boolean(errors.usernameOrEmail)}
            {...register("usernameOrEmail")}
          />
        </div>
        {errors.usernameOrEmail ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {t("usernameRequired")}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
          />
          <Input
            autoComplete="current-password"
            className="h-12 rounded-lg border-slate-300 px-11 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-blue-400 dark:focus:ring-blue-400/15"
            id="password"
            placeholder={t("passwordPlaceholder")}
            type={showPassword ? "text" : "password"}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 outline-none hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-blue-950 dark:hover:text-blue-300 dark:focus-visible:ring-blue-400"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? (
              <EyeOff className="size-[18px]" aria-hidden="true" />
            ) : (
              <Eye className="size-[18px]" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {t("passwordRequired")}
          </p>
        ) : null}
      </div>

      <Button
        className="group h-12 w-full rounded-lg bg-blue-500 text-base text-white hover:bg-blue-600 focus-visible:ring-blue-500 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400 dark:focus-visible:ring-blue-400"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
            {t("submitting")}
          </>
        ) : (
          <>
            {t("submit")}
            <ArrowRight
              aria-hidden="true"
              className="size-[18px] transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </Button>
    </form>
  );
}
