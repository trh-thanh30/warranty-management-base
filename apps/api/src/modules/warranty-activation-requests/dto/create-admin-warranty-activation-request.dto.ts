import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { OmitType } from '@nestjs/mapped-types';
import { IsUUID } from 'class-validator';

export class CreateAdminWarrantyActivationRequestDto extends OmitType(
  CreateWarrantyActivationRequestDto,
  ['warrantyCode'] as const,
) {
  @IsUUID()
  customerId: string;
}
