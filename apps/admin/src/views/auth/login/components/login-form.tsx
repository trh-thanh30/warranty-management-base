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
  type AdminTwoFactorMethod,
  HttpClientError,
  type AdminLoginChallengeResponse,
  type AdminLoginInput,
} from "@repo/shared";
import { Button, Input, Label } from "@repo/ui";
import { useAuth } from "@/src/app/providers/auth-provider";
import { consumeAuthRedirectReason } from "@/src/app/stores/auth-session.store";
import { useRouter } from "@/src/i18n/navigation";
import { useToast } from "@/src/hooks/use-toast";
import { TwoFactorForm } from "./two-factor-form";
import { PinTwoFactorForm } from "./pin-two-factor-form";

type LoginFormProps = {
  onTwoFactorChange?: (challenge: AdminLoginChallengeResponse | null) => void;
};

export function LoginForm({ onTwoFactorChange }: LoginFormProps) {
  const t = useTranslations("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState<AdminTwoFactorMethod>(
    ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP,
  );
  const [challenge, setChallenge] =
    useState<AdminLoginChallengeResponse | null>(null);
  const { login, resendTwoFactor, setupPin, verifyPin, verifyTwoFactor } =
    useAuth();
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
      const nextChallenge = await login({ ...values, method });
      setChallenge(nextChallenge);
      onTwoFactorChange?.(nextChallenge);
      if (nextChallenge.method === ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP) {
        toast.success(t("twoFactorSent"));
      }
    } catch (error) {
      toast.error(
        error instanceof HttpClientError ? error.message : t("genericError"),
      );
    }
  }

  if (challenge) {
    if (challenge.method !== ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP) {
      return (
        <PinTwoFactorForm
          mode={challenge.method}
          onBack={() => {
            setChallenge(null);
            onTwoFactorChange?.(null);
          }}
          onSubmit={async (pin, confirmPin) => {
            if (challenge.method === ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP) {
              await setupPin(challenge.challenge_id, pin, confirmPin ?? "");
            } else {
              await verifyPin(challenge.challenge_id, pin);
            }
            toast.success(t("loginSuccess"));
            router.replace("/dashboard");
          }}
        />
      );
    }
    return (
      <TwoFactorForm
        challenge={challenge}
        onBack={() => {
          setChallenge(null);
          onTwoFactorChange?.(null);
        }}
        onResend={resendTwoFactor}
        onVerify={async (code) => {
          await verifyTwoFactor(challenge.challenge_id, code);
          toast.success(t("loginSuccess"));
          router.replace("/dashboard");
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
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("verificationMethod")}
        </p>
        <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
          {Object.values(ADMIN_TWO_FACTOR_METHOD).map((option) => (
            <button
              aria-pressed={method === option}
              className={`h-10 rounded-md text-sm font-medium transition-colors ${
                method === option
                  ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                  : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              }`}
              key={option}
              onClick={() => setMethod(option)}
              type="button"
            >
              {option === ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP
                ? t("methodEmail")
                : t("methodPin")}
            </button>
          ))}
        </div>
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
