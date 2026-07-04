import { BadRequestError } from '@/common/response';
import { UsersService } from '@/modules/user/user.service';
import { user_role, user_status } from '@prisma/client';

describe('UsersService', () => {
  const tx = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const prismaService = {
    $transaction: jest.fn((callback) => callback(tx)),
  };
  const bcryptService = {
    hashPassword: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tx.user.findMany.mockResolvedValue([]);
    tx.user.count.mockResolvedValue(0);
  });

  it('lists users filtered by multiple roles', async () => {
    const service = new UsersService(
      prismaService as never,
      bcryptService as never,
    );

    await service.findAll({
      roles: 'MODERATOR,CUSTOMER',
      page: 1,
      limit: 20,
    });

    expect(tx.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: {
            in: [user_role.MODERATOR, user_role.CUSTOMER],
          },
        }),
      }),
    );
  });

  it('lists users filtered by one role and status', async () => {
    const service = new UsersService(
      prismaService as never,
      bcryptService as never,
    );

    await service.findAll({
      role: user_role.MODERATOR,
      status: user_status.ACTIVE,
    });

    expect(tx.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: user_role.MODERATOR,
          status: user_status.ACTIVE,
        }),
      }),
    );
  });

  it('rejects invalid role filters', async () => {
    const service = new UsersService(
      prismaService as never,
      bcryptService as never,
    );

    await expect(
      service.findAll({ roles: 'MODERATOR,OWNER' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
