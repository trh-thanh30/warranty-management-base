import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';
import { category_type } from '@prisma/client';

export class CreateCategoryDto {
  @IsEnum(category_type)
  type: category_type;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  @Matches(/^[A-Z0-9_-]+$/i)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsString()
  @Length(2, 160)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  icon?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
