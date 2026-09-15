export function needsRequestCertificateRegeneration(
  metadata: unknown,
  currentVersion: number,
) {
  if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object') {
    return true;
  }

  if (!('templateVersion' in metadata)) return true;

  const version = metadata.templateVersion;
  return (
    typeof version !== 'number' ||
    !Number.isInteger(version) ||
    version < currentVersion
  );
}
