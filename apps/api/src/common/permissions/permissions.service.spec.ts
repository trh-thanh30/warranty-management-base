import { permission_key, user_role } from '@prisma/client';
import { PermissionService } from '@/common/permissions/permissions.service';
import { BadRequestError } from '@/common/response';

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

  it('ignores stale permission overrides that moderators can no longer use', async () => {
    prismaService.userPermission.findMany.mockResolvedValue([
      {
        permission_key: permission_key.SYSTEM_VIEW,
        granted: true,
      },
      {
        permission_key: permission_key.PRODUCT_DELETE,
        granted: true,
      },
    ]);
    const service = new PermissionService(prismaService as never);

    const permissions = await service.getEffectivePermissions(
      'moderator-id',
      user_role.MODERATOR,
    );

    expect(permissions).not.toContain(permission_key.SYSTEM_VIEW);
    expect(permissions).toContain(permission_key.PRODUCT_DELETE);
  });

  it('removes legacy dependent permissions when view access is missing', async () => {
    prismaService.userPermission.findMany.mockResolvedValue([
      {
        permission_key: permission_key.PRODUCT_VIEW,
        granted: false,
      },
    ]);
    const service = new PermissionService(prismaService as never);

    const permissions = await service.getEffectivePermissions(
      'moderator-id',
      user_role.MODERATOR,
    );

    expect(permissions).not.toContain(permission_key.PRODUCT_VIEW);
    expect(permissions).not.toContain(permission_key.PRODUCT_CREATE);
    expect(permissions).not.toContain(permission_key.PRODUCT_UPDATE);
    expect(permissions).not.toContain(permission_key.PRODUCT_ASSIGN_OWNER);
  });

  it('rejects user-management permission overrides for moderators', async () => {
    const service = new PermissionService(prismaService as never);

    await expect(
      service.setUserPermissionOverrides('moderator-id', user_role.MODERATOR, [
        {
          permissionKey: permission_key.USER_PERMISSION_MANAGE,
          granted: true,
        },
      ]),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects permission overrides for non-moderator accounts', async () => {
    const service = new PermissionService(prismaService as never);

    await expect(
      service.setUserPermissionOverrides('customer-id', user_role.CUSTOMER, []),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects moderator overrides with missing view dependencies', async () => {
    const service = new PermissionService(prismaService as never);

    await expect(
      service.setUserPermissionOverrides('moderator-id', user_role.MODERATOR, [
        {
          permissionKey: permission_key.PRODUCT_VIEW,
          granted: false,
        },
      ]),
    ).rejects.toMatchObject({
      code: 'INVALID_PERMISSION_DEPENDENCY',
    });
  });
});
