import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { OmitType } from '@nestjs/mapped-types';

export class CreateAdminWarrantyActivationRequestDto extends OmitType(
  CreateWarrantyActivationRequestDto,
  ['warrantyCode'] as const,
) {}
