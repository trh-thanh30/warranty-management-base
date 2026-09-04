import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { product_status, warranty_status } from '@prisma/client';
import {
  IsBooleanString,
  IsIn,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ListProductsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  ownerCustomerId?: string;

  @IsOptional()
  @IsIn([...Object.values(product_status), 'ALL'])
  status?: product_status | 'ALL';

  @IsOptional()
  @IsBooleanString()
  isPublished?: string;

  @IsOptional()
  @IsBooleanString()
  activationEligible?: string;

  @IsOptional()
  @IsBooleanString()
  activationCodeAssignable?: string;

  @IsOptional()
  @IsBooleanString()
  claimEligible?: string;

  @IsOptional()
  @IsEnum(warranty_status)
  warrantyStatus?: warranty_status;
}
