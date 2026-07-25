export function toProductSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('vi')
    .replaceAll('đ', 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createProductSlug(name: string, productCode: string) {
  const nameSlug = toProductSlug(name);
  const codeSlug = toProductSlug(productCode);

  return [nameSlug, codeSlug].filter(Boolean).join('-');
}
