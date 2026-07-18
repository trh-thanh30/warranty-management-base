import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class LookupLegacyWardDto {
  @IsOptional()
  @IsString()
  legacy_name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  legacy_code?: number;
}
