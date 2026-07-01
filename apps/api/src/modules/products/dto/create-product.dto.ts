import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { product_category, product_status } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @Length(2, 160)
  name: string;

  @IsEnum(product_category)
  category: product_category;

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
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsEnum(product_status)
  status?: product_status;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  serialNumber?: string;

  @IsOptional()
  @IsBoolean()
  autoGenerateWarrantyCode?: boolean;

  @IsOptional()
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  activatedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  durationMonths?: number;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  warrantyTerms?: string;
}
