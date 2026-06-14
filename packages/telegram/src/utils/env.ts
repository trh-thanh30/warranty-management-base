export function readBooleanEnv(value: string | undefined): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

export function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
