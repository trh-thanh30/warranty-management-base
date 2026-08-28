const OPEN_TAG_PATTERN = /^<([a-z][a-z0-9]*)\b[^>]*>$/i;
const CLOSE_TAG_PATTERN = /^<\/([a-z][a-z0-9]*)>$/i;
const VOID_TAG_PATTERN = /^<\/?(?:br|hr|img|meta|link)(?:\s[^>]*)?\/?>$/i;

/**
 * Telegram limits text messages to 4096 characters and photo captions to 1024.
 * Truncate rendered HTML without leaving unclosed formatting tags behind.
 */
export function truncateTelegramHtml(value: string, maxCharacters: number) {
  if (value.length <= maxCharacters) return value;

  const tokens = value.match(/<[^>]+>|[^<]+/g) ?? [];
  const openTags: string[] = [];
  let output = "";
  let truncated = false;

  for (const token of tokens) {
    if (token.startsWith("<")) {
      const closing = token.match(CLOSE_TAG_PATTERN);
      if (closing) {
        const tagName = closing[1];
        if (!tagName) continue;
        const index = openTags.lastIndexOf(tagName.toLowerCase());
        if (index >= 0) openTags.splice(index, 1);
        if (output.length + token.length <= maxCharacters) output += token;
        continue;
      }

      const opening = token.match(OPEN_TAG_PATTERN);
      if (opening && !VOID_TAG_PATTERN.test(token)) {
        const tagName = opening[1];
        if (tagName) openTags.push(tagName.toLowerCase());
      }
      if (output.length + token.length <= maxCharacters) {
        output += token;
      } else {
        truncated = true;
        break;
      }
      continue;
    }

    const textTokens = token.match(/&(?:amp|lt|gt|quot|#\d+);|./gu) ?? [];
    const closingLength = openTags.reduce(
      (total, tag) => total + tag.length + 3,
      0,
    );
    const available = Math.max(
      0,
      maxCharacters - output.length - closingLength - 1,
    );
    const text = textTokens.slice(0, available).join("");
    output += text;
    if (text.length < token.length) {
      output += "…";
      truncated = true;
      break;
    }
  }

  if (!truncated) {
    output = output.slice(0, Math.max(0, maxCharacters - 1)) + "…";
  }

  for (let index = openTags.length - 1; index >= 0; index -= 1) {
    output += `</${openTags[index]}>`;
  }

  return output;
}
