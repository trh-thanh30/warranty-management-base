import { product_status } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
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
  Matches,
  ValidateNested,
} from 'class-validator';

export class ConfirmProductImportRowDto {
  @IsOptional()
  @IsString()
  productCode?: string | null;

  @IsString()
  @Length(1, 64)
  productName: string;

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
  displayName?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  installationPosition?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() || null : value,
  )
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  serialNumber?: string | null;

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
