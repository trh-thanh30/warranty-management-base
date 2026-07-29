export function toTelephoneHref(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function normalizeExternalUrl(value?: string | null) {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(
      candidate.includes("://") ? candidate : `https://${candidate}`,
    );
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function displayWebsite(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}
