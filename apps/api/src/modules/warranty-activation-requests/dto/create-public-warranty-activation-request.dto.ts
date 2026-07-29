import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { OmitType } from '@nestjs/mapped-types';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreatePublicWarrantyActivationRequestDto extends OmitType(
  CreateWarrantyActivationRequestDto,
  ['customerEmail'] as const,
) {
  @IsString()
  @IsEmail()
  @Length(3, 160)
  customerEmail: string;
}
