export function formatWarrantyCertificateDate(value: Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN').format(value);
}
