import { permission_key, user_role } from '@prisma/client';
import { PermissionService } from '@/common/permissions/permissions.service';

describe('PermissionService', () => {
  const prismaService = {
    userPermission: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all permissions for admin without querying overrides', async () => {
    const service = new PermissionService(prismaService as never);

    const permissions = await service.getEffectivePermissions(
      'admin-id',
      user_role.ADMIN,
    );

    expect(permissions).toContain(permission_key.USER_PERMISSION_MANAGE);
    expect(permissions).toContain(permission_key.PRODUCT_DELETE);
    expect(prismaService.userPermission.findMany).not.toHaveBeenCalled();
  });

  it('applies moderator default permissions and user overrides', async () => {
    prismaService.userPermission.findMany.mockResolvedValue([
      {
        permission_key: permission_key.PRODUCT_DELETE,
        granted: true,
      },
      {
        permission_key: permission_key.PRODUCT_CREATE,
        granted: false,
      },
    ]);
    const service = new PermissionService(prismaService as never);

    const permissions = await service.getEffectivePermissions(
      'moderator-id',
      user_role.MODERATOR,
    );

    expect(permissions).toContain(permission_key.PRODUCT_VIEW);
    expect(permissions).toContain(permission_key.PRODUCT_DELETE);
    expect(permissions).not.toContain(permission_key.PRODUCT_CREATE);
  });
});
