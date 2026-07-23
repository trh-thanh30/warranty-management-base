import { PHONE_NUMBER_PATTERN } from '@repo/shared/constants';
import {
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateDealerDto {
  @IsString()
  @Length(2, 160)
  name: string;

  @IsOptional()
  @IsString()
  @Length(8, 32)
  @Matches(PHONE_NUMBER_PATTERN)
  phone?: string;

  @IsString()
  @Length(4, 255)
  address: string;

  @IsString()
  @Length(2, 120)
  province: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  salesName?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
