import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class GeocodeVietnamAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  province!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ward?: string;
}
