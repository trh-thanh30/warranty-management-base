import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { product_category, product_status } from '@prisma/client';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(2, 160)
  name?: string;

  @IsOptional()
  @IsEnum(product_category)
  category?: product_category;

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
  @Length(0, 1000)
  description?: string | null;

  @IsOptional()
  @IsEnum(product_status)
  status?: product_status;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  serialNumber?: string | null;
}
