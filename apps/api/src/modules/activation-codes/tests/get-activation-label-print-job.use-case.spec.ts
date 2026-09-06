import { GetActivationLabelPrintJobUseCase } from '@/modules/activation-codes/use-cases/get-activation-label-print-job.use-case';

describe('GetActivationLabelPrintJobUseCase', () => {
  it('returns the persisted print job by id', async () => {
    const job = { id: 'job-id', status: 'PROCESSING' };
    const repository = {
      findById: jest.fn().mockResolvedValue(job),
    };

    await expect(
      new GetActivationLabelPrintJobUseCase(repository as never).execute(
        'job-id',
      ),
    ).resolves.toBe(job);
  });

  it('rejects an unknown print job', async () => {
    const repository = { findById: jest.fn().mockResolvedValue(null) };

    await expect(
      new GetActivationLabelPrintJobUseCase(repository as never).execute(
        'missing-job',
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
