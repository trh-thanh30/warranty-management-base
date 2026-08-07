import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ActivationFilmItemsDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  windshield?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  frontLeftSide?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  frontRightSide?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  rearLeftSide?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  rearRightSide?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  sunroof?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  rearGlass?: string;
}

export class CreateWarrantyActivationRequestDto {
  @IsOptional()
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  dealerId?: string;

  @IsString()
  @Length(2, 120)
  customerName: string;

  @IsString()
  @Length(6, 32)
  customerPhone: string;

  @IsOptional()
  @IsEmail()
  @Length(3, 160)
  customerEmail?: string;

  @IsOptional()
  @IsDateString()
  customerBirthdate?: string;

  @IsOptional()
  @IsString()
  @Length(2, 32)
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  vehicleModel?: string;

  @IsOptional()
  @IsDateString()
  installedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  warrantyDurationMonths?: number;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  dealerName?: string;

  @IsOptional()
  @IsString()
  @Length(8, 32)
  dealerPhone?: string;

  @IsOptional()
  @IsString()
  @Length(4, 255)
  dealerAddress?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  dealerProvince?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  dealerDistrict?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-90)
  @Max(90)
  dealerLatitude?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-180)
  @Max(180)
  dealerLongitude?: number;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  salesName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivationFilmItemsDto)
  filmItems?: ActivationFilmItemsDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsString()
  @Length(1, 32)
  provinceCode: string;

  @IsString()
  @Length(1, 120)
  provinceName: string;

  @IsString()
  @Length(1, 32)
  wardCode: string;

  @IsString()
  @Length(1, 120)
  wardName: string;

  @IsString()
  @Length(1, 255)
  addressDetail: string;

  @IsOptional()
  @IsString()
  @Length(1, 160)
  productName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  brand?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  manufactureYear?: number;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string;
}
