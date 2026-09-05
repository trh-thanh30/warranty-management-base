import { product_status } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(2, 160)
  name: string;

  @IsInt()
  @Min(1)
  warrantyDurationMonths: number;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  productCode?: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  brand?: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  modelYear?: number;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 10000)
  warrantyTerms?: string;

  @IsOptional()
  @IsObject()
  catalogueMetadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  coverAssetId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  galleryAssetIds?: string[];

  @IsOptional()
  @IsString()
  @Length(0, 160)
  displayName?: string;

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
}
