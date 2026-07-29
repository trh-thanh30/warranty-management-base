export const normalizePathname = (pathname: string) => {
  const withoutLocale = pathname.replace(/^\/(?:vi|en)(?=\/|$)/, "") || "/";

  return withoutLocale.length > 1
    ? withoutLocale.replace(/\/$/, "")
    : withoutLocale;
};

export const isNavigationItemActive = (
  pathname: string,
  activePath: string,
) => {
  const normalizedPathname = normalizePathname(pathname);

  return activePath === "/"
    ? normalizedPathname === "/"
    : normalizedPathname === activePath ||
        normalizedPathname.startsWith(`${activePath}/`);
};
