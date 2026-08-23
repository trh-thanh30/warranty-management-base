import { CATEGORY_ACTIVATION_FIELD_TYPES } from '@repo/shared/constants';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CategoryActivationFieldOptionDto {
  @IsString()
  @Length(1, 160)
  label!: string;

  @IsString()
  @Length(1, 160)
  value!: string;
}

export class CategoryActivationFieldDto {
  @IsString()
  @Length(1, 64)
  @Matches(/^[a-z][A-Za-z0-9_]*$/)
  key!: string;

  @IsString()
  @Length(1, 160)
  label!: string;

  @IsIn(CATEGORY_ACTIVATION_FIELD_TYPES)
  type!: (typeof CATEGORY_ACTIVATION_FIELD_TYPES)[number];

  @IsOptional()
  @IsString()
  @Length(0, 200)
  placeholder?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  order?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique((option: CategoryActivationFieldOptionDto) => option.value)
  @ValidateNested({ each: true })
  @Type(() => CategoryActivationFieldOptionDto)
  options?: CategoryActivationFieldOptionDto[];
}

export class UpdateCategoryActivationFieldsDto {
  @IsBoolean()
  activationFormEnabled!: boolean;

  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique((field: CategoryActivationFieldDto) => field.key)
  @ValidateNested({ each: true })
  @Type(() => CategoryActivationFieldDto)
  activationFields!: CategoryActivationFieldDto[];
}
