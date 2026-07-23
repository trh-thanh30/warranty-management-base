import { PHONE_NUMBER_PATTERN } from '@repo/shared/constants';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateDealerDto {
  @IsOptional()
  @IsString()
  @Length(2, 160)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(8, 32)
  @Matches(PHONE_NUMBER_PATTERN)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @Length(4, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  province?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  salesName?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;
}
