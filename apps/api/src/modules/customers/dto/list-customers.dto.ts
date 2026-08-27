import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListCustomersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'DELETED', 'ALL'])
  status?: 'ACTIVE' | 'DELETED' | 'ALL';
}
