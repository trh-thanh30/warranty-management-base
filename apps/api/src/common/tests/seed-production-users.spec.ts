import { user_role, user_status } from '@prisma/client';
import {
  seedProductionModerator,
  seedProductionUsers,
  type ProductionSeedUserClient,
} from '../../../prisma/seed-production-users';

describe('Production login user seed', () => {
  it('can seed only the moderator without admin credentials', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const create = jest
      .fn()
      .mockImplementation(({ data }) =>
        Promise.resolve({ id: 'moderator-id', ...data }),
      );
    const client = {
      user: {
        create,
        findUnique,
        update: jest.fn(),
      },
    } as unknown as ProductionSeedUserClient;

    const moderator = await seedProductionModerator(
      client,
      {
        SEED_MODERATOR_EMAIL: 'moderator@company.test',
        SEED_MODERATOR_PASSWORD: 'moderator-password',
        SEED_MODERATOR_USERNAME: 'moderator',
      },
      (password) => `hashed:${password}`,
    );

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'moderator@company.test',
        password: 'hashed:moderator-password',
        role: user_role.MODERATOR,
        username: 'moderator',
      }),
    });
    expect(moderator.role).toBe(user_role.MODERATOR);
  });

  it('seeds an active verified admin and moderator', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockImplementation(({ data }) =>
      Promise.resolve({
        id: `${data.role.toLowerCase()}-id`,
        ...data,
      }),
    );
    const client = {
      user: {
        create,
        findUnique,
        update: jest.fn(),
      },
    } as unknown as ProductionSeedUserClient;

    const result = await seedProductionUsers(
      client,
      {
        SEED_ADMIN_EMAIL: 'admin@company.test',
        SEED_ADMIN_PASSWORD: 'admin-password',
        SEED_ADMIN_USERNAME: 'admin',
        SEED_MODERATOR_EMAIL: 'moderator@company.test',
        SEED_MODERATOR_PASSWORD: 'moderator-password',
        SEED_MODERATOR_USERNAME: 'moderator',
      },
      (password) => `hashed:${password}`,
    );

    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({
        email: 'admin@company.test',
        is_verified: true,
        password: 'hashed:admin-password',
        role: user_role.ADMIN,
        status: user_status.ACTIVE,
        username: 'admin',
      }),
    });
    expect(create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({
        email: 'moderator@company.test',
        is_verified: true,
        password: 'hashed:moderator-password',
        role: user_role.MODERATOR,
        status: user_status.ACTIVE,
        username: 'moderator',
      }),
    });
    expect(result.admin.role).toBe(user_role.ADMIN);
    expect(result.moderator.role).toBe(user_role.MODERATOR);
  });

  it('rejects production admin and moderator identities that overlap', async () => {
    const client = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as ProductionSeedUserClient;

    await expect(
      seedProductionUsers(
        client,
        {
          SEED_ADMIN_EMAIL: 'staff@company.test',
          SEED_ADMIN_PASSWORD: 'admin-password',
          SEED_ADMIN_USERNAME: 'admin',
          SEED_MODERATOR_EMAIL: 'staff@company.test',
          SEED_MODERATOR_PASSWORD: 'moderator-password',
          SEED_MODERATOR_USERNAME: 'moderator',
        },
        (password) => `hashed:${password}`,
      ),
    ).rejects.toThrow('must use different email addresses and usernames');
  });
});
