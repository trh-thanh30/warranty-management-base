export function normalizeComboboxSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function filterComboboxItem(
  value: string,
  search: string,
  keywords: string[] = [],
) {
  const normalizedSearch = normalizeComboboxSearch(search);
  if (!normalizedSearch) return 1;

  const searchableText = normalizeComboboxSearch(
    [value, ...keywords].join(" "),
  );
  return searchableText.includes(normalizedSearch) ? 1 : 0;
}
