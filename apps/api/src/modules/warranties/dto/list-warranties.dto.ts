import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { warranty_status } from '@prisma/client';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListWarrantiesDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([...Object.values(warranty_status), 'ALL'])
  status?: warranty_status | 'ALL';
}
