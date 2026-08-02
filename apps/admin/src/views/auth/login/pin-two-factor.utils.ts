import { HttpClientError } from "@repo/shared";

type TranslatePinError = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export function resolvePinErrorMessage(
  error: unknown,
  translate: TranslatePinError,
) {
  if (!(error instanceof HttpClientError)) {
    return translate("pinGenericError");
  }

  if (error.code === "INVALID_PIN") {
    const remainingAttempts = getRemainingAttempts(error.details);

    if (remainingAttempts !== null) {
      return translate("pinInvalid", { remainingAttempts });
    }
  }

  if (error.code === "PIN_VERIFICATION_LOCKED") {
    return translate("pinLocked");
  }

  return translate("pinGenericError");
}

function getRemainingAttempts(details: unknown) {
  if (
    typeof details !== "object" ||
    details === null ||
    !("remainingAttempts" in details)
  ) {
    return null;
  }

  const remainingAttempts = details.remainingAttempts;
  return typeof remainingAttempts === "number" && remainingAttempts >= 0
    ? remainingAttempts
    : null;
}
