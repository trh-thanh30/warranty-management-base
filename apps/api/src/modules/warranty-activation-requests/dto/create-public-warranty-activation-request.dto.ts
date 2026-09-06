import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

/** Public input contains only customer-entered data; product and policy data are resolved from the activation code. */
export class CreatePublicWarrantyActivationRequestDto {
  @IsString()
  @Length(6, 120)
  @Matches(/^[A-Z0-9-]+$/i)
  activationCode: string;

  @IsString()
  @Length(2, 120)
  customerName: string;

  @IsString()
  @Length(6, 32)
  customerPhone: string;

  @IsString()
  @IsEmail()
  @Length(3, 160)
  customerEmail: string;

  @IsOptional()
  @IsString()
  @Length(2, 32)
  vehiclePlate?: string;

  @IsString()
  @Length(1, 32)
  provinceCode: string;

  @IsString()
  @Length(1, 120)
  provinceName: string;

  @IsString()
  @Length(1, 32)
  wardCode: string;

  @IsString()
  @Length(1, 120)
  wardName: string;

  @IsString()
  @Length(1, 255)
  addressDetail: string;
}
