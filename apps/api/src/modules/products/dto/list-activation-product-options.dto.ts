import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ListActivationProductOptionsDto extends PaginationQueryDto {
  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsString()
  search?: string;
}
