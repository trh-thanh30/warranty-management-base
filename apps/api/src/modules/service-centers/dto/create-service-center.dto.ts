import { PHONE_NUMBER_PATTERN } from '@repo/shared/constants';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
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
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-180)
  @Max(180)
  longitude?: number;
}
