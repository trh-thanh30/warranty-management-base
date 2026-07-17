const AUTH_ENTRY_PATHS = [
  "/auth/login-admin",
  "/auth/refresh",
  "/auth/logout",
  "/auth/change-password",
] as const;

const BUSINESS_UNAUTHORIZED_PATHS = [
  "/auth/login-admin",
  "/auth/change-password",
] as const;

function includesPath(url: string, paths: readonly string[]) {
  return paths.some((path) => url.includes(path));
}

export function isAuthEntryPoint(url: string) {
  return includesPath(url, AUTH_ENTRY_PATHS);
}

export function shouldAttemptTokenRefresh(
  status: number | undefined,
  url: string,
  alreadyRetried: boolean,
) {
  return status === 401 && !alreadyRetried && !isAuthEntryPoint(url);
}

export function shouldClearSessionAfterUnauthorized(url: string) {
  return !includesPath(url, BUSINESS_UNAUTHORIZED_PATHS);
}
