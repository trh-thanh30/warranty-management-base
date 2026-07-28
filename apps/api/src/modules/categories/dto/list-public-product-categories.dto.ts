import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsBooleanString, IsOptional } from 'class-validator';

export class ListPublicProductCategoriesDto extends PaginationQueryDto {
  @IsOptional()
  @IsBooleanString()
  hasImage?: string;
}
