import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  IsIn,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { category_type } from '@prisma/client';

export class ListCategoriesDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(category_type)
  type?: category_type;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsIn(['true', 'false', 'all'])
  isActive?: 'true' | 'false' | 'all';

  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}
