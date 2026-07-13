import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { warranty_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListWarrantiesDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(warranty_status)
  status?: warranty_status;
}
