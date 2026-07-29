export function normalizeUploadFileName(fileName: string) {
  const decoded = Buffer.from(fileName, 'latin1').toString('utf8');

  return decoded.includes('\uFFFD') ? fileName : decoded;
}
