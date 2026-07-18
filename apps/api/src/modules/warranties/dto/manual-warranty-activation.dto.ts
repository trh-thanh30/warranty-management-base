import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { product_category } from '@prisma/client';

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

  @IsString()
  @Length(2, 160)
  name: string;

  @IsEnum(product_category)
  category: product_category;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  brand?: string;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  manufactureYear?: number;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
}

export class ManualWarrantyActivationWarrantyDto {
  @IsDateString()
  activatedAt: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsInt()
  @Min(1)
  @Max(120)
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
