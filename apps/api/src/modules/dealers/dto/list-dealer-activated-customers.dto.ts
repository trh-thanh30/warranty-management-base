import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { warranty_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class ListDealerActivatedCustomersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;

  @IsOptional()
  @IsEnum(warranty_status)
  warrantyStatus?: warranty_status;
}
