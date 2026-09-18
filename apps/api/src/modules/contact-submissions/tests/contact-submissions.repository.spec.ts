import { ContactSubmissionsRepository } from '@/modules/contact-submissions/repository/contact-submissions.repository';

describe('ContactSubmissionsRepository.list', () => {
  it('sorts newest submissions first with id as a stable tie-breaker', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({
          contactSubmission: {
            count,
            findMany,
          },
        }),
      ),
    };
    const repository = new ContactSubmissionsRepository(prismaService as never);

    await repository.list({ page: 1, limit: 20 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it.each([
    { status: undefined, expectedStatus: { not: 'ARCHIVED' } },
    { status: 'ARCHIVED' as const, expectedStatus: 'ARCHIVED' },
    { status: 'NEW' as const, expectedStatus: 'NEW' },
  ])(
    'uses the same status filter for items and total when status is $status',
    async ({ status, expectedStatus }) => {
      const findMany = jest.fn().mockResolvedValue([]);
      const count = jest.fn().mockResolvedValue(0);
      const repository = new ContactSubmissionsRepository({
        $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
          callback({ contactSubmission: { count, findMany } }),
        ),
      } as never);

      await repository.list({ page: 1, limit: 10, status });

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: expectedStatus }),
        }),
      );
      expect(count).toHaveBeenCalledWith({
        where: expect.objectContaining({ status: expectedStatus }),
      });
    },
  );
});

describe('ContactSubmissionsRepository.listForExport', () => {
  it.each([
    { status: undefined, expectedStatus: { not: 'ARCHIVED' } },
    { status: 'ARCHIVED' as const, expectedStatus: 'ARCHIVED' },
  ])(
    'exports all matching rows when status is $status',
    async ({ status, expectedStatus }) => {
      const findMany = jest.fn().mockResolvedValue([]);
      const repository = new ContactSubmissionsRepository({
        contactSubmission: { findMany },
      } as never);

      await repository.listForExport({ search: ' Nguyen ', status });

      expect(findMany).toHaveBeenCalledWith({
        where: {
          status: expectedStatus,
          OR: [
            { full_name: { contains: 'Nguyen', mode: 'insensitive' } },
            { phone: { contains: 'Nguyen', mode: 'insensitive' } },
            { content: { contains: 'Nguyen', mode: 'insensitive' } },
            { source_path: { contains: 'Nguyen', mode: 'insensitive' } },
          ],
        },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      });
      expect(findMany.mock.calls[0][0]).not.toHaveProperty('take');
      expect(findMany.mock.calls[0][0]).not.toHaveProperty('skip');
    },
  );
});
