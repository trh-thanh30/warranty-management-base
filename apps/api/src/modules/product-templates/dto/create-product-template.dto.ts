import { product_category } from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
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

export class CreateProductTemplateDto {
  @IsString()
  @Length(2, 160)
  name: string;

  @IsEnum(product_category)
  category: product_category;

  @IsUUID()
  categoryId: string;

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
  @Length(0, 5000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  defaultWarrantyDurationMonths?: number;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  defaultWarrantyTerms?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  coverAssetId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  galleryAssetIds?: string[];
}
