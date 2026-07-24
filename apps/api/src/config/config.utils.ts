import { isAbsolute, resolve } from 'node:path';

export function parseOptionalPositiveInt(
  value: string | undefined,
): number | null {
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function resolveFromWorkingDirectory(value: string): string {
  return isAbsolute(value) ? value : resolve(process.cwd(), value);
}
