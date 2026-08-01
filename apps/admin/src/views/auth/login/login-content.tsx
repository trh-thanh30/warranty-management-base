"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_LOGIN_CHALLENGE_METHOD,
  type AdminLoginChallengeResponse,
} from "@repo/shared";
import { LoginForm } from "./components/login-form";

type LoginContentProps = {
  welcome: string;
  title: string;
  description: string;
  twoFactorTitle: string;
  twoFactorDescription: string;
};

export function LoginContent({
  welcome,
  title,
  description,
  twoFactorTitle,
  twoFactorDescription,
}: LoginContentProps) {
  const t = useTranslations("Login");
  const [challenge, setChallenge] =
    useState<AdminLoginChallengeResponse | null>(null);

  const titleText =
    challenge?.method === ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP
      ? t("pinSetupTitle")
      : twoFactorTitle;
  const descriptionText =
    challenge?.method === ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP
      ? t("pinSetupDescription")
      : challenge?.method === ADMIN_LOGIN_CHALLENGE_METHOD.PIN_VERIFY
        ? t("pinVerifyDescription")
        : challenge
          ? twoFactorDescription.replace(
              "{email}",
              challenge.masked_destination ?? "",
            )
          : description;

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {welcome}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">
          {challenge ? titleText : title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {descriptionText}
        </p>
      </div>

      <LoginForm onTwoFactorChange={setChallenge} />
    </>
  );
}
