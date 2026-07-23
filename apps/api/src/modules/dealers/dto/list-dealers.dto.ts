import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsBooleanString, IsOptional, IsString, Length } from 'class-validator';

export class ListDealersDto extends PaginationQueryDto {
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
