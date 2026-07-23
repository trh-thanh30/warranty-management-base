import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';

export function buildWarrantyActivationRequestFullAddress(
  dto: CreateWarrantyActivationRequestDto,
) {
  return [dto.addressDetail, dto.wardName, dto.provinceName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

export function optionalTrim(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

export function normalizePhone(value?: string | null) {
  return normalizeText(value).replace(/\D/g, '');
}
