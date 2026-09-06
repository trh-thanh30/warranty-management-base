import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class ListAvailableActivationCodesDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsIn(['ALL', 'ASSIGNED', 'UNASSIGNED'])
  assignment?: 'ALL' | 'ASSIGNED' | 'UNASSIGNED';

  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}
