const MAX_KEY_LENGTH = 64;

export function slugifyCategoryActivationFieldKey(label: string): string {
  const withoutDiacritics = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const slug = withoutDiacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, MAX_KEY_LENGTH);

  if (!slug) return 'field';
  return /^[a-z]/.test(slug) ? slug : `field_${slug}`.slice(0, MAX_KEY_LENGTH);
}

export function uniqueCategoryActivationFieldKey(
  baseKey: string,
  usedKeys: Set<string>,
): string {
  if (!usedKeys.has(baseKey)) return baseKey;

  let suffix = 2;
  while (true) {
    const suffixText = `_${suffix}`;
    const candidate = `${baseKey.slice(0, MAX_KEY_LENGTH - suffixText.length)}${suffixText}`;
    if (!usedKeys.has(candidate)) return candidate;
    suffix += 1;
  }
}
