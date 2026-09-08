import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { DealerAccessPolicy } from '@/modules/dealers/service/dealer-access.policy';
import { Test, type TestingModule } from '@nestjs/testing';

describe('DealerAccessPolicy', () => {
  const repository = {
    findMembershipByDealerAndUser: jest.fn(),
    listAssignedToUser: jest.fn(),
  };
  let module: TestingModule;
  let policy: DealerAccessPolicy;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        DealerAccessPolicy,
        { provide: DealersRepository, useValue: repository },
      ],
    }).compile();
    policy = module.get(DealerAccessPolicy);
  });

  afterAll(async () => module.close());

  beforeEach(() => jest.clearAllMocks());

  it('allows a moderator to access any dealer while membership scoping is disabled', async () => {
    repository.findMembershipByDealerAndUser.mockResolvedValue(null);
    await expect(
      policy.assertCanAccess(
        { id: 'moderator-id', role: 'MODERATOR' },
        'dealer-id',
      ),
    ).resolves.toBeUndefined();
    expect(repository.findMembershipByDealerAndUser).not.toHaveBeenCalled();
  });

  it('allows an assigned moderator', async () => {
    repository.findMembershipByDealerAndUser.mockResolvedValue({
      id: 'membership-id',
    });

    await expect(
      policy.assertCanAccess(
        { id: 'moderator-id', role: 'MODERATOR' },
        'dealer-id',
      ),
    ).resolves.toBeUndefined();
  });

  it('allows an admin without requiring a membership', async () => {
    await expect(
      policy.assertCanAccess({ id: 'admin-id', role: 'ADMIN' }, 'dealer-id'),
    ).resolves.toBeUndefined();
    expect(repository.findMembershipByDealerAndUser).not.toHaveBeenCalled();
  });

  it('does not constrain a moderator list while membership scoping is disabled', async () => {
    repository.listAssignedToUser.mockResolvedValue([
      { id: 'dealer-a' },
      { id: 'dealer-b' },
    ]);

    await expect(
      policy.resolveAccessibleDealerIds({
        id: 'moderator-id',
        role: 'MODERATOR',
      }),
    ).resolves.toBeUndefined();
    expect(repository.listAssignedToUser).not.toHaveBeenCalled();
  });

  it('does not constrain an admin list to dealer ids', async () => {
    await expect(
      policy.resolveAccessibleDealerIds({ id: 'admin-id', role: 'ADMIN' }),
    ).resolves.toBeUndefined();
    expect(repository.listAssignedToUser).not.toHaveBeenCalled();
  });

  it('allows a moderator to access a record without a dealer while scoping is disabled', async () => {
    await expect(
      policy.assertCanAccessRecord(
        { id: 'moderator-id', role: 'MODERATOR' },
        null,
      ),
    ).resolves.toBeUndefined();
  });
});
