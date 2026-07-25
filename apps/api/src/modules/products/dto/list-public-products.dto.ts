import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class ListPublicProductsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsIn(['name', 'publishedAt'])
  declare sortBy?: 'name' | 'publishedAt';
}
