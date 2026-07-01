import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, ValidateNested } from 'class-validator';
import { permission_key } from '@prisma/client';

export class UserPermissionOverrideDto {
  @IsEnum(permission_key)
  permissionKey: permission_key;

  @IsBoolean()
  granted: boolean;
}

export class UpdateUserPermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionOverrideDto)
  overrides: UserPermissionOverrideDto[];
}
