import { ConflictError, NotFoundError } from '@/common/response';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { AddDealerMemberUseCase } from '@/modules/dealers/use-cases/add-dealer-member.use-case';
import { ListDealerMembersUseCase } from '@/modules/dealers/use-cases/list-dealer-members.use-case';
import { ListAssignedDealersUseCase } from '@/modules/dealers/use-cases/list-assigned-dealers.use-case';
import { RemoveDealerMemberUseCase } from '@/modules/dealers/use-cases/remove-dealer-member.use-case';
import { UsersService } from '@/modules/user/user.service';
import { BadRequestError } from '@/common/response';
import { Test, type TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';

const dealer = { id: 'dealer-id' };
const dealerRecord = {
  id: dealer.id,
  dealer_code: 'DLR-001',
  name: 'Dealer A',
  phone: null,
  address: 'Ha Noi',
  province: 'Ha Noi',
  district: null,
  latitude: 21.0285,
  longitude: 105.8542,
  sales_name: null,
  is_active: true,
  metadata: null,
  created_at: new Date('2026-09-07T01:00:00.000Z'),
  updated_at: new Date('2026-09-07T01:00:00.000Z'),
};
const staff = {
  id: 'staff-id',
  email: 'staff@example.com',
  username: 'staff',
  full_name: 'Nguyen Van Staff',
  status: 'ACTIVE',
  role: 'MODERATOR',
};
const membership = {
  id: 'membership-id',
  dealer_id: dealer.id,
  user_id: staff.id,
  created_by_id: 'admin-id',
  created_at: new Date('2026-09-07T01:00:00.000Z'),
  updated_at: new Date('2026-09-07T01:00:00.000Z'),
  created_by: {
    id: 'admin-id',
    email: 'admin@example.com',
    username: 'admin',
    full_name: 'System Admin',
  },
  user: staff,
};

describe('Dealer membership use cases', () => {
  const repository = {
    createMembership: jest.fn(),
    deleteMembership: jest.fn(),
    findById: jest.fn(),
    findMembershipByDealerAndUser: jest.fn(),
    findMembershipById: jest.fn(),
    listMemberships: jest.fn(),
    listAssignedToUser: jest.fn(),
  };
  const usersService = { findById: jest.fn() };
  let module: TestingModule;
  let addMember: AddDealerMemberUseCase;
  let listMembers: ListDealerMembersUseCase;
  let listAssignedDealers: ListAssignedDealersUseCase;
  let removeMember: RemoveDealerMemberUseCase;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AddDealerMemberUseCase,
        ListDealerMembersUseCase,
        ListAssignedDealersUseCase,
        RemoveDealerMemberUseCase,
        { provide: DealersRepository, useValue: repository },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();
    addMember = module.get(AddDealerMemberUseCase);
    listMembers = module.get(ListDealerMembersUseCase);
    listAssignedDealers = module.get(ListAssignedDealersUseCase);
    removeMember = module.get(RemoveDealerMemberUseCase);
  });

  afterAll(async () => module.close());

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findById.mockResolvedValue(dealer);
    repository.findMembershipByDealerAndUser.mockResolvedValue(null);
    repository.findMembershipById.mockResolvedValue(membership);
    usersService.findById.mockResolvedValue(staff);
  });

  it('assigns a staff account to a dealer', async () => {
    repository.createMembership.mockResolvedValue(membership);

    await expect(
      addMember.execute(
        dealer.id,
        { userId: staff.id },
        { createdByUserId: 'admin-id' },
      ),
    ).resolves.toEqual({
      id: 'membership-id',
      dealerId: dealer.id,
      userId: staff.id,
      createdById: 'admin-id',
      createdAt: '2026-09-07T01:00:00.000Z',
      updatedAt: '2026-09-07T01:00:00.000Z',
      createdBy: {
        id: 'admin-id',
        email: 'admin@example.com',
        username: 'admin',
        fullName: 'System Admin',
      },
      user: {
        id: staff.id,
        email: staff.email,
        username: staff.username,
        fullName: staff.full_name,
        status: 'ACTIVE',
      },
    });
    expect(repository.createMembership).toHaveBeenCalledWith({
      created_by_id: 'admin-id',
      dealer_id: dealer.id,
      user_id: staff.id,
    });
  });

  it('rejects duplicate dealer membership', async () => {
    repository.findMembershipByDealerAndUser.mockResolvedValue(membership);

    await expect(
      addMember.execute(dealer.id, { userId: staff.id }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repository.createMembership).not.toHaveBeenCalled();
  });

  it('maps a concurrent duplicate assignment to a conflict', async () => {
    repository.createMembership.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        clientVersion: 'test',
        code: 'P2002',
        meta: { target: ['dealer_id', 'user_id'] },
      }),
    );

    await expect(
      addMember.execute(dealer.id, { userId: staff.id }),
    ).rejects.toMatchObject({ code: 'DEALER_MEMBERSHIP_EXISTS' });
  });

  it('only assigns staff accounts', async () => {
    usersService.findById.mockResolvedValue({ ...staff, role: 'CUSTOMER' });

    await expect(
      addMember.execute(dealer.id, { userId: staff.id }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('does not assign an inactive staff account', async () => {
    usersService.findById.mockResolvedValue({ ...staff, status: 'INACTIVE' });

    await expect(
      addMember.execute(dealer.id, { userId: staff.id }),
    ).rejects.toMatchObject({ code: 'DEALER_MEMBER_USER_INACTIVE' });
    expect(repository.createMembership).not.toHaveBeenCalled();
  });

  it('lists members of an existing dealer', async () => {
    repository.listMemberships.mockResolvedValue([membership]);

    const result = await listMembers.execute(dealer.id);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({ dealerId: dealer.id, userId: staff.id }),
    );
  });

  it('lists dealers assigned to the current staff account', async () => {
    repository.listAssignedToUser.mockResolvedValue([dealerRecord]);

    await expect(listAssignedDealers.execute(staff.id)).resolves.toEqual([
      expect.objectContaining({ id: dealer.id, name: 'Dealer A' }),
    ]);
    expect(repository.listAssignedToUser).toHaveBeenCalledWith(staff.id);
  });

  it('removes an existing dealer membership', async () => {
    repository.deleteMembership.mockResolvedValue(membership);

    await expect(
      removeMember.execute(dealer.id, membership.id),
    ).resolves.toEqual({ id: membership.id });
    expect(repository.deleteMembership).toHaveBeenCalledWith(membership.id);
  });

  it('does not remove a membership from another dealer', async () => {
    repository.findMembershipById.mockResolvedValue(null);

    await expect(
      removeMember.execute(dealer.id, 'missing-id'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
