"use client";

import { useState } from "react";
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
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  function handleTwoFactorChange(active: boolean, email?: string) {
    setIsTwoFactor(active);
    setMaskedEmail(email ?? "");
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {welcome}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">
          {isTwoFactor ? twoFactorTitle : title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {isTwoFactor
            ? twoFactorDescription.replace("{email}", maskedEmail)
            : description}
        </p>
      </div>

      <LoginForm onTwoFactorChange={handleTwoFactorChange} />
    </>
  );
}
