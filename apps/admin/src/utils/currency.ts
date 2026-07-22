export function formatVndInputValue(value: string) {
  if (!value) return "";

  const [rawInteger = "0", fraction] = value.split(".");
  const integer = normalizeInteger(rawInteger);
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return fraction === undefined
    ? groupedInteger
    : `${groupedInteger},${fraction}`;
}

export function normalizeVndInputValue(value: string): string | null {
  const compact = value.replace(/\s/g, "");
  if (!compact) return "";
  if (!/^[\d.,]+$/.test(compact)) return null;

  const withoutGrouping = compact.replace(/\./g, "");
  const parts = withoutGrouping.split(",");
  if (parts.length > 2) return null;

  const [rawInteger = "", fraction] = parts;
  if (fraction !== undefined && fraction.length > 2) return null;

  const integer = normalizeInteger(rawInteger || "0");
  return fraction === undefined ? integer : `${integer}.${fraction}`;
}

function normalizeInteger(value: string) {
  return value.replace(/^0+(?=\d)/, "");
}
