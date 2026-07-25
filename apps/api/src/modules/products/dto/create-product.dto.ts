import { product_status } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  Length,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
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
  @IsObject()
  metadata?: Record<string, unknown>;
}
