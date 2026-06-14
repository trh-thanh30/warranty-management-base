import {
  notification_delivery_status,
  notification_scope,
  notification_source,
} from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAdminNotificationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(notification_source)
  source?: notification_source;

  @IsOptional()
  @IsEnum(notification_scope)
  scope?: notification_scope;

  @IsOptional()
  @IsEnum(notification_delivery_status)
  delivery_status?: notification_delivery_status;
}
