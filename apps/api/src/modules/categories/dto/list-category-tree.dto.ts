import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsEnum, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { category_type } from '@prisma/client';

const CATEGORY_TREE_SORT_FIELDS = [
  'name',
  'slug',
  'order',
  'createdAt',
  'updatedAt',
  'isActive',
] as const;

export class ListCategoryTreeDto extends PaginationQueryDto {
  @IsEnum(category_type)
  type: category_type;

  @IsOptional()
  @IsIn(['true', 'false', 'all'])
  isActive?: 'true' | 'false' | 'all';

  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsIn(CATEGORY_TREE_SORT_FIELDS)
  declare sortBy?: (typeof CATEGORY_TREE_SORT_FIELDS)[number];

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
