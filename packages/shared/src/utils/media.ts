const MEDIA_SOURCE_PATTERN =
  /<(?:img|video|source)\b[^>]*\bsrc=(["'])(.*?)\1/giu;

export function extractMediaUrls(content: string): string[] {
  const urls = new Set<string>();

  for (const match of content.matchAll(MEDIA_SOURCE_PATTERN)) {
    const url = match[2]?.trim();
    if (url) urls.add(url);
  }

  return [...urls];
}

export function getRemovedMediaUrls(
  previousContent: string,
  nextContent: string,
): string[] {
  const nextUrls = new Set(extractMediaUrls(nextContent));

  return extractMediaUrls(previousContent).filter((url) => !nextUrls.has(url));
}
