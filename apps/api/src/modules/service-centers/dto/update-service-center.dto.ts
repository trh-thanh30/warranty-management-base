import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { PHONE_NUMBER_PATTERN } from '@repo/shared/constants';

export class UpdateServiceCenterDto {
  @IsOptional()
  @IsString()
  @Length(2, 160)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(8, 32)
  @Matches(PHONE_NUMBER_PATTERN)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  province?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  district?: string;

  @IsOptional()
  @IsString()
  @Length(4, 255)
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
