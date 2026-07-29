import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProductTemplateDto } from './create-product-template.dto';

export class UpdateProductTemplateDto extends PartialType(
  CreateProductTemplateDto,
) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
