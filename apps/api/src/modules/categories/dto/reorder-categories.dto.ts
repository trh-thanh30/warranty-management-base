import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ReorderCategoryItemDto {
  @IsUUID()
  id: string;

  @IsInt()
  order: number;
}

export class ReorderCategoriesDto {
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderCategoryItemDto)
  items: ReorderCategoryItemDto[];
}
