import { ActivationLabelPrintQueueService } from '@/modules/activation-codes/services/activation-label-print-queue.service';

describe('ActivationLabelPrintQueueService', () => {
  const config = {
    printAttempts: 3,
    printBackoffMs: 5000,
    printCompletedRetentionSeconds: 3600,
    printFailedRetentionSeconds: 86400,
    printQueueSize: 8,
  };

  it('enqueues an idempotent print job with retry policy', async () => {
    const queue = {
      add: jest.fn().mockResolvedValue({ id: 'bull-id' }),
      getJob: jest.fn().mockResolvedValue(null),
      getWaitingCount: jest.fn().mockResolvedValue(1),
    };
    await new ActivationLabelPrintQueueService(
      queue as never,
      config as never,
    ).enqueue('print-job-id');

    expect(queue.add).toHaveBeenCalledWith(
      'render-labels',
      { printJobId: 'print-job-id' },
      expect.objectContaining({
        jobId: 'print-job-id',
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      }),
    );
  });

  it('rejects when the waiting queue is full', async () => {
    const queue = {
      add: jest.fn(),
      getJob: jest.fn().mockResolvedValue(null),
      getWaitingCount: jest.fn().mockResolvedValue(8),
    };
    await expect(
      new ActivationLabelPrintQueueService(
        queue as never,
        config as never,
      ).enqueue('print-job-id'),
    ).rejects.toMatchObject({ code: 'ACTIVATION_LABEL_QUEUE_FULL' });
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('returns an existing BullMQ job without adding a duplicate', async () => {
    const existing = { id: 'existing-job' };
    const queue = {
      add: jest.fn(),
      getJob: jest.fn().mockResolvedValue(existing),
      getWaitingCount: jest.fn(),
    };

    await expect(
      new ActivationLabelPrintQueueService(
        queue as never,
        config as never,
      ).enqueue('print-job-id'),
    ).resolves.toBe(existing);

    expect(queue.add).not.toHaveBeenCalled();
    expect(queue.getWaitingCount).not.toHaveBeenCalled();
  });

  it('removes an exhausted BullMQ job before re-enqueueing a retry', async () => {
    const failedJob = {
      getState: jest.fn().mockResolvedValue('failed'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const queue = {
      add: jest.fn().mockResolvedValue({ id: 'new-bull-id' }),
      getJob: jest.fn().mockResolvedValue(failedJob),
      getWaitingCount: jest.fn().mockResolvedValue(0),
    };

    await new ActivationLabelPrintQueueService(
      queue as never,
      config as never,
    ).enqueue('print-job-id', { replaceFailed: true });

    expect(failedJob.remove).toHaveBeenCalledTimes(1);
    expect(queue.add).toHaveBeenCalledWith(
      'render-labels',
      { printJobId: 'print-job-id' },
      expect.objectContaining({ jobId: 'print-job-id' }),
    );
  });
});
