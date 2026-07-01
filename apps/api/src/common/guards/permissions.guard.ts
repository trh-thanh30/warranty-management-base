import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionService } from '@/common/permissions/permissions.service';
import { ForbiddenError } from '@/common/response';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { permission_key, user_role } from '@prisma/client';

type PermissionRequest = {
  effectivePermissions?: permission_key[];
  user?: {
    id?: string;
    role?: user_role | string;
  };
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get(
      Permissions,
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<PermissionRequest>();
    const user = request.user;

    if (!user?.id || !user.role) {
      throw new ForbiddenError('User not found in request');
    }

    const effectivePermissions =
      request.effectivePermissions ??
      (await this.permissionService.getEffectivePermissions(
        user.id,
        user.role,
      ));

    request.effectivePermissions = effectivePermissions;

    const hasAllPermissions = requiredPermissions.every((permission) =>
      effectivePermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenError('Access denied.');
    }

    return true;
  }
}
