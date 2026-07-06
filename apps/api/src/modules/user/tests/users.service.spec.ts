import { BadRequestError, ConflictError } from '@/common/response';
import { UsersService } from '@/modules/user/user.service';
import { Prisma, user_role, user_status } from '@prisma/client';

describe('UsersService', () => {
  const tx = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const prismaService = {
    $transaction: jest.fn((callback) => callback(tx)),
    user: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const bcryptService = {
    hashPassword: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tx.user.findMany.mockResolvedValue([]);
    tx.user.count.mockResolvedValue(0);
    bcryptService.hashPassword.mockResolvedValue('hashed-password');
  });

  it('creates a verified moderator with a generated temporary password', async () => {
    prismaService.user.create.mockResolvedValue({
      id: 'moderator-id',
      email: 'staff@example.com',
      username: 'staff',
      full_name: 'Staff Member',
      phone: null,
      avatar_url: null,
      role: user_role.MODERATOR,
      status: user_status.ACTIVE,
      is_verified: true,
      created_at: new Date('2026-07-05T00:00:00.000Z'),
      updated_at: new Date('2026-07-05T00:00:00.000Z'),
    });
    const service = new UsersService(
      prismaService as never,
      bcryptService as never,
    );

    const result = await service.create({
      email: 'staff@example.com',
      full_name: 'Staff Member',
      role: user_role.MODERATOR,
      username: 'staff',
    });

    const temporaryPassword = bcryptService.hashPassword.mock.calls[0]?.[0];
    expect(temporaryPassword).toEqual(expect.any(String));
    expect(temporaryPassword).toHaveLength(12);
    expect(temporaryPassword).toMatch(/[a-z]/);
    expect(temporaryPassword).toMatch(/[A-Z]/);
    expect(temporaryPassword).toMatch(/[0-9]/);
    expect(temporaryPassword).toMatch(/[^A-Za-z0-9]/);
    expect(prismaService.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          is_verified: true,
          password: 'hashed-password',
          role: user_role.MODERATOR,
          status: user_status.ACTIVE,
        }),
        select: expect.not.objectContaining({
          password: true,
          refresh_token: true,
        }),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        temporaryPassword,
        user: expect.not.objectContaining({
          password: expect.anything(),
          refresh_token: expect.anything(),
        }),
      }),
    );
  });

  it('returns a field-specific conflict when a staff account already exists', async () => {
    prismaService.user.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      }),
    );
    const service = new UsersService(
      prismaService as never,
      bcryptService as never,
    );

    await expect(
      service.create({
        email: 'staff@example.com',
        full_name: 'Staff Member',
        role: user_role.MODERATOR,
        username: 'staff',
      }),
    ).rejects.toMatchObject<Partial<ConflictError>>({
      code: 'USER_ACCOUNT_EXISTS',
      details: { fields: ['email'] },
      statusCode: 409,
    });
  });

  it('returns a field-specific conflict when updating to duplicate staff details', async () => {
    prismaService.user.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['username'] },
      }),
    );
    const service = new UsersService(
      prismaService as never,
      bcryptService as never,
    );

    await expect(
      service.update('moderator-id', {
        username: 'existing-staff',
      }),
    ).rejects.toMatchObject<Partial<ConflictError>>({
      code: 'USER_ACCOUNT_EXISTS',
      details: { fields: ['username'] },
      statusCode: 409,
    });
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
