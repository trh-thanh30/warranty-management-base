import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { category_type } from '@prisma/client';

export class ListCategoryParentOptionsDto {
  @IsEnum(category_type)
  type: category_type;

  @IsOptional()
  @IsUUID()
  currentCategoryId?: string;
}
