import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class ListServiceCentersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  province?: string;

  @IsOptional()
  @IsIn(['true', 'false', 'all'])
  isActive?: 'true' | 'false' | 'all';
}
