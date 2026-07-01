import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { permission_key, user_role } from '@prisma/client';
import {
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  normalizeUserRole,
  type PermissionKey,
} from '@repo/shared/constants';

@Injectable()
export class PermissionService {
  constructor(private readonly prismaService: PrismaService) {}

  async hasPermission(
    userId: string,
    role: user_role,
    key: permission_key | PermissionKey,
  ): Promise<boolean> {
    const permissions = await this.getEffectivePermissions(userId, role);
    return permissions.includes(key);
  }

  async getEffectivePermissions(
    userId: string,
    role: user_role,
  ): Promise<permission_key[]> {
    const normalizedRole = normalizeUserRole(role);

    if (normalizedRole === 'admin') {
      return ALL_PERMISSIONS;
    }

    if (!normalizedRole) {
      return [];
    }

    const effectivePermissions = new Set<PermissionKey>(
      ROLE_DEFAULT_PERMISSIONS[normalizedRole],
    );

    const overrides = await this.prismaService.userPermission.findMany({
      where: { user_id: userId },
      select: {
        permission_key: true,
        granted: true,
      },
    });

    for (const override of overrides) {
      const key = override.permission_key;

      if (override.granted) {
        effectivePermissions.add(key);
        continue;
      }

      effectivePermissions.delete(key);
    }

    return Array.from(effectivePermissions);
  }

  async setUserPermissionOverrides(
    userId: string,
    overrides: Array<{ permissionKey: permission_key; granted: boolean }>,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.userPermission.deleteMany({
        where: { user_id: userId },
      });

      if (overrides.length === 0) {
        return [];
      }

      await tx.userPermission.createMany({
        data: overrides.map((override) => ({
          user_id: userId,
          permission_key: override.permissionKey,
          granted: override.granted,
        })),
      });

      return tx.userPermission.findMany({
        where: { user_id: userId },
        orderBy: { permission_key: 'asc' },
      });
    });
  }

  async getUserPermissionOverrides(userId: string) {
    return this.prismaService.userPermission.findMany({
      where: { user_id: userId },
      orderBy: { permission_key: 'asc' },
    });
  }
}
