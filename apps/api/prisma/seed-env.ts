const MINIMUM_SEED_PASSWORD_LENGTH = 8;

export function requireSeedPassword(
  variableName: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const password = env[variableName];

  if (!password) {
    throw new Error(`${variableName} is required to seed login users`);
  }

  if (password.length < MINIMUM_SEED_PASSWORD_LENGTH) {
    throw new Error(
      `${variableName} must contain at least ${MINIMUM_SEED_PASSWORD_LENGTH} characters`,
    );
  }

  return password;
}
