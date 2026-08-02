"use client";

import { ADMIN_LOGIN_CHALLENGE_METHOD } from "@repo/shared";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LoginForm } from "./components/login-form";
import type { LoginFlowState } from "./login.types";

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
  const [flow, setFlow] = useState<LoginFlowState>(null);
  const challenge = flow?.step === "VERIFICATION" ? flow.challenge : null;

  const titleText =
    flow?.step === "METHOD_SELECTION"
      ? t("methodSelectionTitle")
      : challenge?.method === ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP
        ? t("pinSetupTitle")
        : twoFactorTitle;
  const descriptionText =
    flow?.step === "METHOD_SELECTION"
      ? t("methodSelectionDescription")
      : challenge?.method === ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP
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
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          {flow ? titleText : title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {descriptionText}
        </p>
      </div>

      <LoginForm onFlowChange={setFlow} />
    </>
  );
}
