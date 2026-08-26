import { CustomersRepository } from '@/modules/customers/repository/customers.repository';

describe('CustomersRepository.list', () => {
  it('sorts customers by newest creation date and id by default', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({ customer: { count, findMany } }),
      ),
    };
    const repository = new CustomersRepository(prismaService as never);

    await repository.list({});

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('keeps a selected customer sort before creation date and id tie-breakers', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({ customer: { count, findMany } }),
      ),
    };
    const repository = new CustomersRepository(prismaService as never);

    await repository.list({ sortBy: 'fullName', sortOrder: 'asc' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ full_name: 'asc' }, { created_at: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('uses the same stable default order for customer exports', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new CustomersRepository({
      customer: { findMany },
    } as never);

    await repository.listForExport({});

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      }),
    );
  });
});
