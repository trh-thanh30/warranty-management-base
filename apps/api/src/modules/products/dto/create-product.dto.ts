import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
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
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  coverAssetId?: string;
}
