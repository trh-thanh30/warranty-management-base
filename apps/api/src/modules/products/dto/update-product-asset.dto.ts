import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { product_asset_role } from '@prisma/client';

export class UpdateProductAssetDto {
  @IsOptional()
  @IsEnum(product_asset_role)
  role?: product_asset_role;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string | null;
}
