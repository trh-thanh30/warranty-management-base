import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsBooleanString, IsOptional, IsString, Length } from 'class-validator';

export class ListProductTemplatesDto extends PaginationQueryDto {
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @IsOptional()
  @IsBooleanString()
  isPublished?: string;

  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}
