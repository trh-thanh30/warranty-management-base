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
});
