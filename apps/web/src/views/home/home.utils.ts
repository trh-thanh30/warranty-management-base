const HTML_TAG_PATTERN = /<[^>]*>/g;
const WHITESPACE_PATTERN = /\s+/g;

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&nbsp;": " ",
  "&quot;": '"',
};

export function richTextToPlainText(value: string | null): string {
  if (!value) return "";

  return Object.entries(HTML_ENTITIES)
    .reduce(
      (text, [entity, character]) => text.replaceAll(entity, character),
      value.replace(HTML_TAG_PATTERN, " "),
    )
    .replace(WHITESPACE_PATTERN, " ")
    .trim();
}
