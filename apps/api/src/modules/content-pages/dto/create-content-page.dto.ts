import { content_page_kind, content_page_status } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateContentPageDto {
  @IsString()
  @Length(2, 120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsString()
  @Length(2, 255)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  summary?: string;

  @IsString()
  @Length(1, 20000)
  content!: string;

  @IsOptional()
  @IsEnum(content_page_kind)
  kind?: content_page_kind;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(content_page_status)
  status?: content_page_status;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
