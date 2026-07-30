export function normalizePhoneNumber(value?: string | null) {
  return value?.replace(/\D/g, "") ?? "";
}
