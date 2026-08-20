import type {
  WarrantyCertificatePdfInput,
  WarrantyCertificateViewModel,
} from '@/modules/warranty-certificates/warranty-certificate.types';
import { formatWarrantyCertificateDate } from '@/modules/warranty-certificates/utils/warranty-certificate-date.util';
import {
  formatWarrantyCertificateValue,
  formatWarrantyDuration,
} from '@/modules/warranty-certificates/utils/warranty-certificate-display.util';

const FILM_FIELD_LABELS: Record<string, string> = {
  windshield: 'Kính lái',
  frontLeftSide: 'Kính sườn trước - trái',
  frontRightSide: 'Kính sườn trước - phải',
  rearLeftSide: 'Kính sườn sau - trái',
  rearRightSide: 'Kính sườn sau - phải',
  rearGlass: 'Kính lưng',
};

const FILM_FIELD_ORDER = Object.keys(FILM_FIELD_LABELS);

export function buildWarrantyCertificateViewModel(
  input: WarrantyCertificatePdfInput,
  issuedAt = new Date(),
): WarrantyCertificateViewModel {
  return {
    certificate: {
      installedAt: formatValue(
        formatWarrantyCertificateDate(input.installedAt ?? input.startDate),
      ),
      issuedAt: formatValue(formatWarrantyCertificateDate(issuedAt)),
      number: formatValue(input.certificateNumber),
    },
    customer: {
      address: formatValue(input.customerAddress),
      email: formatValue(input.customerEmail),
      fullName: formatValue(input.customerName),
      phone: formatValue(input.customerPhone),
    },
    dealer: {
      name: formatValue(input.dealerName),
    },
    vehicle: {
      model: formatValue(input.vehicleModel),
      plate: formatValue(input.vehiclePlate),
    },
    products: [
      {
        durationLabel: formatWarrantyDuration(input.warrantyDurationMonths),
        expiryDate: formatValue(formatWarrantyCertificateDate(input.endDate)),
        positionLabel: 'Sản phẩm',
        productCode: formatValue(null),
        productName: formatValue(input.productName),
        serialNumber: formatValue(input.serialNumber),
        warrantyCode: formatValue(input.warrantyCode),
      },
    ],
    activationFields: toActivationFields(input.filmItems),
  };
}

function toActivationFields(filmItems?: Record<string, string> | null) {
  if (!filmItems) return [];

  return Object.entries(filmItems)
    .filter(([, value]) => value.trim().length > 0)
    .sort(([left], [right]) => fieldOrder(left) - fieldOrder(right))
    .map(([key, value]) => ({
      label: FILM_FIELD_LABELS[key] ?? key,
      value: value.trim(),
    }));
}

function fieldOrder(key: string) {
  const knownIndex = FILM_FIELD_ORDER.indexOf(key);
  return knownIndex === -1 ? FILM_FIELD_ORDER.length : knownIndex;
}

function formatValue(value: string | number | null | undefined) {
  return formatWarrantyCertificateValue(value);
}
