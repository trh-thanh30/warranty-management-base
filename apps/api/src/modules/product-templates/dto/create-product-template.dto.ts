import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductTemplateSpecificationDto {
  @IsString()
  @Length(1, 160)
  key: string;

  @IsString()
  @Length(1, 160)
  value: string;
}

export class ProductTemplateMetadataDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  applications?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ProductTemplateSpecificationDto)
  specifications?: ProductTemplateSpecificationDto[];
}

export class CreateProductTemplateDto {
  @IsOptional()
  @ValidateIf(
    (_, value) => typeof value !== 'string' || value.trim().length > 0,
  )
  @IsString()
  @Length(1, 64)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9._-]*$/)
  sku?: string;

  @IsOptional()
  @ValidateIf(
    (_, value) => typeof value !== 'string' || value.trim().length > 0,
  )
  @IsString()
  @Length(2, 180)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsString()
  @Length(2, 160)
  name: string;

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
  modelYear?: number;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultWarrantyDurationMonths?: number | null;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  defaultWarrantyTerms?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProductTemplateMetadataDto)
  metadata?: ProductTemplateMetadataDto;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsUUID()
  coverAssetId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  galleryAssetIds?: string[];
}
