import { formatWarrantyCertificateDate } from '@/modules/warranty-certificates/utils/warranty-certificate-date.util';

export function formatWarrantyCertificateValue(
  value: string | number | null | undefined,
) {
  if (value === null || value === undefined) return 'Không';

  const formatted = String(value).trim();
  return formatted && formatted !== '-' ? formatted : 'Không';
}

export function formatWarrantyDuration(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value} tháng`
    : 'Không';
}

export function formatWarrantyPeriod(
  durationMonths: number | null | undefined,
  endDate: Date | null,
) {
  const duration = formatWarrantyDuration(durationMonths);
  const formattedEndDate = formatWarrantyCertificateValue(
    formatWarrantyCertificateDate(endDate),
  );

  if (duration === 'Không') return formattedEndDate;
  if (formattedEndDate === 'Không') return duration;

  return `${duration} - ${formattedEndDate}`;
}
