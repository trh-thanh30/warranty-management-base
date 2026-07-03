import { IsBooleanString, IsOptional, IsString, Length } from 'class-validator';

export class ListServiceCentersDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  province?: string;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}
