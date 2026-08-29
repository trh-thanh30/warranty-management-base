import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { product_status } from '@prisma/client';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(2, 160)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  warrantyDurationMonths?: number;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  productCode?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  brand?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  model?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1900)
  modelYear?: number | null;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string | null;

  @IsOptional()
  @IsUUID()
  coverAssetId?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  galleryAssetIds?: string[];

  @IsOptional()
  @IsString()
  @Length(0, 10000)
  warrantyTerms?: string | null;

  @IsOptional()
  @IsObject()
  catalogueMetadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  displayName?: string | null;

  @IsOptional()
  @IsEnum(product_status)
  status?: product_status;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  serialNumber?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @Length(0, 64)
  warrantyCode?: string;
}
