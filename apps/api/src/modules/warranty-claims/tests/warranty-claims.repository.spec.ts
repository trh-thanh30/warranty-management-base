import { PrismaService } from '@/database/prisma/prisma.service';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';

describe('WarrantyClaimsRepository', () => {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(0);
  const prismaService = {
    $transaction: jest.fn(
      (
        callback: (transaction: {
          warrantyClaim: {
            count: typeof count;
            findMany: typeof findMany;
          };
        }) => unknown,
      ) =>
        callback({
          warrantyClaim: {
            count,
            findMany,
          },
        }),
    ),
  } as unknown as PrismaService;
  const repository = new WarrantyClaimsRepository(prismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters unassigned claims by a null service center', async () => {
    await repository.list({ assignmentStatus: 'UNASSIGNED' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ service_center_id: null }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({ service_center_id: null }),
    });
  });

  it('filters assigned claims by a non-null service center', async () => {
    await repository.list({ assignmentStatus: 'ASSIGNED' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          service_center_id: { not: null },
        }),
      }),
    );
  });
});
