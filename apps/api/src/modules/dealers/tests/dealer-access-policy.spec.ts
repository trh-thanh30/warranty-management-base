import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { DealerAccessPolicy } from '@/modules/dealers/service/dealer-access.policy';
import { Test, type TestingModule } from '@nestjs/testing';

describe('DealerAccessPolicy', () => {
  const repository = {
    findMembershipByDealerAndUser: jest.fn(),
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

  it('denies a moderator who is not assigned to the dealer', async () => {
    repository.findMembershipByDealerAndUser.mockResolvedValue(null);
    await expect(
      policy.assertCanAccess(
        { id: 'moderator-id', role: 'MODERATOR' },
        'dealer-id',
      ),
    ).rejects.toMatchObject({ code: 'DEALER_ACCESS_DENIED' });
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
});
