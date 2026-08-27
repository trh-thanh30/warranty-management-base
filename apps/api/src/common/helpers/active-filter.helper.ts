export type ActiveFilterValue = 'true' | 'false' | 'all' | undefined;

export function resolveActiveFilter(value: ActiveFilterValue) {
  if (value === 'all') return undefined;
  return value === undefined || value === 'true';
}
