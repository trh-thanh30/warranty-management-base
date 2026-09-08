import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class ManualWarrantyActivationCustomerDto {
  @IsString()
  @Length(2, 120)
  fullName: string;

  @IsString()
  @Length(6, 32)
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(1, 255)
  address: string;
}

export class ManualWarrantyActivationProductDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @ValidateIf((dto: ManualWarrantyActivationProductDto) => !dto.id)
  @IsUUID()
  categoryId?: string;

  @ValidateIf((dto: ManualWarrantyActivationProductDto) => !dto.id)
  @IsString()
  @Length(2, 160)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  brand?: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  model?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  displayName?: string;
}

export class ManualWarrantyActivationWarrantyDto {
  @IsDateString()
  activatedAt: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsInt()
  @Min(1)
  durationMonths: number;

  @IsOptional()
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  terms?: string;
}

export class ManualWarrantyActivationDto {
  @ValidateNested()
  @Type(() => ManualWarrantyActivationCustomerDto)
  customer: ManualWarrantyActivationCustomerDto;

  @ValidateNested()
  @Type(() => ManualWarrantyActivationProductDto)
  product: ManualWarrantyActivationProductDto;

  @ValidateNested()
  @Type(() => ManualWarrantyActivationWarrantyDto)
  warranty: ManualWarrantyActivationWarrantyDto;
}
