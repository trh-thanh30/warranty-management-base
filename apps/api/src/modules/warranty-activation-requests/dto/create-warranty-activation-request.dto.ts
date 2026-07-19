import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateWarrantyActivationRequestDto {
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode: string;

  @IsString()
  @Length(2, 120)
  customerName: string;

  @IsString()
  @Length(6, 32)
  customerPhone: string;

  @IsEmail()
  @Length(3, 160)
  customerEmail: string;

  @IsOptional()
  @IsDateString()
  customerBirthdate?: string;

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
