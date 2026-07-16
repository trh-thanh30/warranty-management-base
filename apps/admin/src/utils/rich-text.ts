export function isEmptyRichText(value: string | null | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  const text = trimmed
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return !trimmed || trimmed === "<p></p>" || !text;
}

export function toOptionalRichText(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  return isEmptyRichText(value) ? undefined : value.trim();
}

export function toNullableRichText(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return isEmptyRichText(value) ? null : value.trim();
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";

  // 1. Decode raw HTML entities (e.g. &lt;a&gt; becomes <a>)
  const decoded = html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 2. Remove all HTML tags
  return decoded
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}
