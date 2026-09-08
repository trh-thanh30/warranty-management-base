import { product_status } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ConfirmProductImportRowDto {
  @IsOptional()
  @IsString()
  productCode?: string | null;

  @IsString()
  @Length(1, 160)
  displayName: string;

  @IsString()
  @Length(1, 64)
  categoryCode: string;

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
  @Max(2200)
  modelYear?: number | null;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  shortDescription?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string | null;

  @IsInt()
  @Min(1)
  @Max(600)
  warrantyDurationMonths: number;

  @IsOptional()
  @IsString()
  @Length(0, 4000)
  warrantyTerms?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  installationPosition?: string | null;

  @IsEnum(product_status)
  status: product_status;
}

export class ConfirmProductImportDto {
  @IsIn(['upsert', 'replace'])
  mode: 'upsert' | 'replace';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmProductImportRowDto)
  rows: ConfirmProductImportRowDto[];
}
