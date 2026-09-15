// Bump this only when the request certificate PDF output changes.
export const REQUEST_CERTIFICATE_TEMPLATE_VERSION = 1;

export function needsRequestCertificateRegeneration(metadata: unknown) {
  if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object') {
    return true;
  }

  if (!('templateVersion' in metadata)) return true;

  const version = metadata.templateVersion;
  return (
    typeof version !== 'number' ||
    !Number.isInteger(version) ||
    version < REQUEST_CERTIFICATE_TEMPLATE_VERSION
  );
}
