import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  IsBooleanString,
  IsIn,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ListProductTemplatesDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['true', 'false', 'all'])
  isActive?: 'true' | 'false' | 'all';

  @IsOptional()
  @IsBooleanString()
  isPublished?: string;

  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}
