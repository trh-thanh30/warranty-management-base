import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  product_category,
  product_status,
  warranty_status,
} from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListProductsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(product_category)
  category?: product_category;

  @IsOptional()
  @IsEnum(product_status)
  status?: product_status;

  @IsOptional()
  @IsEnum(warranty_status)
  warrantyStatus?: warranty_status;
}
