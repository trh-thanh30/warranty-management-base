import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class ListAvailableActivationCodesDto extends PaginationQueryDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}
