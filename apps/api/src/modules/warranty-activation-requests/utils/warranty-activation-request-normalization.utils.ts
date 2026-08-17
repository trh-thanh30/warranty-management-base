import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';

export function buildWarrantyActivationRequestFullAddress(
  dto: CreateWarrantyActivationRequestDto,
) {
  const detailParts = splitAddressParts(dto.addressDetail);
  const locationParts = [dto.wardName, dto.provinceName]
    .map((part) => part.trim())
    .filter(Boolean);

  while (endsWithAddressParts(detailParts, locationParts)) {
    detailParts.splice(-locationParts.length, locationParts.length);
  }

  return [...detailParts, ...locationParts].join(', ');
}

function splitAddressParts(address: string) {
  return address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function endsWithAddressParts(address: string[], suffix: string[]) {
  if (suffix.length === 0 || address.length < suffix.length) return false;

  return suffix.every(
    (part, index) => address[address.length - suffix.length + index] === part,
  );
}

export function optionalTrim(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}
