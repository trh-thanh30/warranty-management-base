import { PHONE_NUMBER_PATTERN } from '@repo/shared/constants';
import {
  IsBoolean,
  IsDefined,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
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
  district?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  salesName?: string | null;

  @ValidateIf(
    (dto: UpdateDealerDto) =>
      dto.longitude !== undefined && dto.longitude !== null,
  )
  @IsDefined()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-90)
  @Max(90)
  latitude?: number | null;

  @ValidateIf(
    (dto: UpdateDealerDto) =>
      dto.latitude !== undefined && dto.latitude !== null,
  )
  @IsDefined()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-180)
  @Max(180)
  longitude?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;
}
