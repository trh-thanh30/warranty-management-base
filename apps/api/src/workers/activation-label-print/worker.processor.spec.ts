import { ActivationLabelPrintProcessor } from '@/workers/activation-label-print/worker.processor';

describe('ActivationLabelPrintProcessor', () => {
  it('renders, uploads and marks a print job completed', async () => {
    const jobs = {
      findById: jest.fn().mockResolvedValue({
        id: 'print-job-id',
        batch_id: 'batch-id',
        from_index: 1,
        to_index: 50,
      }),
      markCompleted: jest.fn().mockResolvedValue(undefined),
      markProcessing: jest.fn().mockResolvedValue(undefined),
    };
    const renderer = {
      execute: jest.fn().mockResolvedValue({
        filename: 'labels.pdf',
        pdf: Buffer.from('%PDF-test'),
      }),
    };
    const assets = {
      upload: jest.fn().mockResolvedValue({ path: 'private/labels.pdf' }),
    };
    const processor = new ActivationLabelPrintProcessor(
      jobs as never,
      renderer as never,
      assets as never,
    );

    await processor.process({
      attemptsMade: 0,
      data: { printJobId: 'print-job-id' },
      opts: { attempts: 3 },
    } as never);

    expect(renderer.execute).toHaveBeenCalledWith('batch-id', {
      from: 1,
      to: 50,
    });
    expect(assets.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'labels.pdf',
        mimetype: 'application/pdf',
      }),
      { accessType: 'PRIVATE', folder: 'activation-labels' },
    );
    expect(jobs.markCompleted).toHaveBeenCalledWith('print-job-id', {
      filename: 'labels.pdf',
      storageKey: 'private/labels.pdf',
    });
  });

  it('marks the job failed only after the final BullMQ attempt', async () => {
    const error = new Error('Chromium unavailable');
    const jobs = {
      findById: jest.fn().mockResolvedValue({
        id: 'print-job-id',
        batch_id: 'batch-id',
        from_index: 1,
        to_index: 1,
      }),
      markFailed: jest.fn().mockResolvedValue(undefined),
      markProcessing: jest.fn().mockResolvedValue(undefined),
    };
    const renderer = { execute: jest.fn().mockRejectedValue(error) };
    const processor = new ActivationLabelPrintProcessor(
      jobs as never,
      renderer as never,
      {} as never,
    );

    await expect(
      processor.process({
        attemptsMade: 2,
        data: { printJobId: 'print-job-id' },
        opts: { attempts: 3 },
      } as never),
    ).rejects.toBe(error);

    expect(jobs.markFailed).toHaveBeenCalledWith(
      'print-job-id',
      'Chromium unavailable',
      3,
    );
  });
});
