import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  @Matches(/^[A-Z0-9_-]+$/i)
  code?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string | null;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  icon?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  imageUrl?: string | null;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  activationCodeEnabled?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;
}
