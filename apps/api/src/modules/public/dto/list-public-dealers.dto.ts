import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class ListPublicDealersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  province?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  district?: string;

  @ValidateIf((value: ListPublicDealersDto) => value.longitude !== undefined)
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @ValidateIf((value: ListPublicDealersDto) => value.latitude !== undefined)
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  radiusKm?: number;
}
