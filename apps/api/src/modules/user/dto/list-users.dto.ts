import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { user_role, user_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListUsersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(user_role)
  role?: user_role;

  @IsOptional()
  @IsString()
  roles?: string;

  @IsOptional()
  @IsEnum(user_status)
  status?: user_status;
}
