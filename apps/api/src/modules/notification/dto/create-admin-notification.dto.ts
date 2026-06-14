import { notification_scope, user_role } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateAdminNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(notification_scope)
  scope: notification_scope;

  @ValidateIf(
    (dto: CreateAdminNotificationDto) => dto.scope === notification_scope.ROLE,
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(user_role, { each: true })
  target_roles?: user_role[];

  @ValidateIf(
    (dto: CreateAdminNotificationDto) => dto.scope === notification_scope.USER,
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  target_user_ids?: string[];

  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreateSystemNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(notification_scope)
  scope: notification_scope;

  @ValidateIf(
    (dto: CreateSystemNotificationDto) => dto.scope === notification_scope.ROLE,
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(user_role, { each: true })
  target_roles?: user_role[];

  @ValidateIf(
    (dto: CreateSystemNotificationDto) => dto.scope === notification_scope.USER,
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  target_user_ids?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
