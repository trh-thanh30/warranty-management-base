import {
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
  @IsInt()
  @Min(1)
  warrantyDurationMonths?: number;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  productCode?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

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
