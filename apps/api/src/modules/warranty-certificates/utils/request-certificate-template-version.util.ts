export function getRequestCertificateTemplateVersion(
  env: NodeJS.ProcessEnv = process.env,
) {
  return Number(env.REQUEST_CERTIFICATE_TEMPLATE_VERSION ?? 1);
}

export function needsRequestCertificateRegeneration(
  metadata: unknown,
  currentVersion = getRequestCertificateTemplateVersion(),
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
