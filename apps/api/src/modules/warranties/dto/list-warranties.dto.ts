import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { warranty_status } from '@prisma/client';
import {
  IsBooleanString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ListWarrantiesDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBooleanString()
  claimEligible?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([...Object.values(warranty_status), 'ALL'])
  status?: warranty_status | 'ALL';
}
