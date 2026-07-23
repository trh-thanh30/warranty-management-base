import { product_category, product_status } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConfirmProductImportRowDto {
  @IsOptional()
  @IsString()
  productCode?: string | null;

  @IsString()
  @Length(2, 160)
  name: string;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  installationPosition?: string | null;

  @IsEnum(product_category)
  category: product_category;

  @IsOptional()
  @IsString()
  categoryCode?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  brand?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  model?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  manufactureYear?: number | null;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  serialNumber?: string | null;

  @IsEnum(product_status)
  status: product_status;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  warrantyDurationMonths?: number | null;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  warrantyTerms?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string | null;
}

export class ConfirmProductImportDto {
  @IsIn(['upsert', 'replace'])
  mode: 'upsert' | 'replace';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmProductImportRowDto)
  rows: ConfirmProductImportRowDto[];
}
