import { DownloadActivationLabelPrintJobUseCase } from '@/modules/activation-codes/use-cases/download-activation-label-print-job.use-case';

describe('DownloadActivationLabelPrintJobUseCase', () => {
  it('returns a private asset stream for a completed job', async () => {
    const stream = { pipe: jest.fn() };
    const repository = {
      findById: jest.fn().mockResolvedValue({
        batch: { batch_code: 'BATCH-001' },
        filename: 'labels.pdf',
        status: 'COMPLETED',
        storage_key: 'private/labels.pdf',
      }),
    };
    const assets = {
      getStream: jest.fn().mockResolvedValue(stream),
    };

    await expect(
      new DownloadActivationLabelPrintJobUseCase(
        repository as never,
        assets as never,
      ).execute('job-id'),
    ).resolves.toEqual({ filename: 'labels.pdf', stream });
    expect(assets.getStream).toHaveBeenCalledWith('private/labels.pdf');
  });

  it.each([
    null,
    { status: 'PROCESSING', storage_key: null },
    { status: 'COMPLETED', storage_key: null },
  ])('rejects a job without a completed PDF: %j', async (job) => {
    const repository = { findById: jest.fn().mockResolvedValue(job) };

    await expect(
      new DownloadActivationLabelPrintJobUseCase(
        repository as never,
        {} as never,
      ).execute('job-id'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
