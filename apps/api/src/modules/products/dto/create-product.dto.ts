import { product_status } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  Length,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  productCode?: string;

  @IsUUID()
  templateId: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

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
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
