import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { product_status, warranty_status } from '@prisma/client';
import {
  IsBooleanString,
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
  templateId?: string;

  @IsOptional()
  @IsUUID()
  ownerCustomerId?: string;

  @IsOptional()
  @IsEnum(product_status)
  status?: product_status;

  @IsOptional()
  @IsBooleanString()
  isPublished?: string;

  @IsOptional()
  @IsBooleanString()
  activationEligible?: string;

  @IsOptional()
  @IsBooleanString()
  claimEligible?: string;

  @IsOptional()
  @IsEnum(warranty_status)
  warrantyStatus?: warranty_status;
}
