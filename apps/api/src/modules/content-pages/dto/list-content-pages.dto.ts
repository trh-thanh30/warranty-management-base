import { content_page_kind, content_page_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class ListContentPagesDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsEnum(content_page_kind)
  kind?: content_page_kind;

  @IsOptional()
  @IsEnum(content_page_status)
  status?: content_page_status;
}
