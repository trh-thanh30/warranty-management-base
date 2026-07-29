import { product_status } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConfirmProductImportRowDto {
  @IsOptional()
  @IsString()
  productCode?: string | null;

  @IsString()
  @Length(1, 64)
  templateSku: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  displayName?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  installationPosition?: string | null;

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
