import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { activation_code_status } from '@prisma/client';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class ListActivationCodeBatchesDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsIn(Object.values(activation_code_status))
  status?: activation_code_status;
}
