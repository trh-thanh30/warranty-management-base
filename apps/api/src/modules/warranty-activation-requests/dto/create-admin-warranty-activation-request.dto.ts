import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { IsLocalAddressDetail } from '@/modules/warranty-activation-requests/dto/is-local-address-detail.decorator';
import { OmitType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateAdminWarrantyActivationRequestDto extends OmitType(
  CreateWarrantyActivationRequestDto,
  [
    'addressDetail',
    'provinceCode',
    'provinceName',
    'wardCode',
    'wardName',
    'warrantyCode',
  ] as const,
) {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsBoolean()
  updateCustomerProfile?: boolean;

  @IsString()
  @Length(0, 32)
  provinceCode: string;

  @IsString()
  @Length(0, 120)
  provinceName: string;

  @IsString()
  @Length(0, 32)
  wardCode: string;

  @IsString()
  @Length(0, 120)
  wardName: string;

  @IsString()
  @Length(0, 255)
  @IsLocalAddressDetail()
  addressDetail: string;
}
