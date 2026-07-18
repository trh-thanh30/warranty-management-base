import { PHONE_NUMBER_PATTERN } from '@repo/shared/constants';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class CreateServiceCenterDto {
  @IsString()
  @Length(2, 160)
  name: string;

  @IsOptional()
  @IsString()
  @Length(8, 32)
  @Matches(PHONE_NUMBER_PATTERN)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Length(2, 120)
  province: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  district?: string;

  @IsString()
  @Length(4, 255)
  address: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  googleMapsUrl?: string;
}
