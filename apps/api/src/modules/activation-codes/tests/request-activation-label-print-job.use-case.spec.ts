import { RequestActivationLabelPrintJobUseCase } from '@/modules/activation-codes/use-cases/request-activation-label-print-job.use-case';

describe('RequestActivationLabelPrintJobUseCase', () => {
  const batches = { findWithCodes: jest.fn() };
  const jobs = {
    create: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    markFailed: jest.fn(),
    markQueued: jest.fn(),
  };
  const queue = { enqueue: jest.fn() };
  const useCase = new RequestActivationLabelPrintJobUseCase(
    batches as never,
    jobs as never,
    queue as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    batches.findWithCodes.mockResolvedValue({
      id: 'batch-id',
      codes: Array.from({ length: 50 }, (_, index) => ({
        id: `code-${index}`,
      })),
    });
  });

  it('requeues the same persisted job when the previous attempt failed', async () => {
    const failedJob = {
      id: 'print-job-id',
      status: 'FAILED',
      from_index: 1,
      to_index: 50,
    };
    jobs.findByIdempotencyKey.mockResolvedValue(failedJob);
    queue.enqueue.mockResolvedValue({ id: 'bull-job-id' });
    jobs.markQueued.mockResolvedValue({ ...failedJob, status: 'QUEUED' });

    await expect(
      useCase.execute({
        batchId: 'batch-id',
        requestedById: 'admin-id',
      }),
    ).resolves.toMatchObject({ status: 'QUEUED' });

    expect(queue.enqueue).toHaveBeenCalledWith('print-job-id', {
      replaceFailed: true,
    });
    expect(jobs.markQueued).toHaveBeenCalledWith('print-job-id', 'bull-job-id');
    expect(jobs.create).not.toHaveBeenCalled();
  });

  it('returns an existing completed job without enqueuing again', async () => {
    const existing = { id: 'print-job-id', status: 'COMPLETED' };
    jobs.findByIdempotencyKey.mockResolvedValue(existing);

    await expect(
      useCase.execute({
        batchId: 'batch-id',
        requestedById: 'admin-id',
      }),
    ).resolves.toBe(existing);

    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it('ensures an existing queued job is still present in BullMQ', async () => {
    const existing = { id: 'print-job-id', status: 'QUEUED' };
    jobs.findByIdempotencyKey.mockResolvedValue(existing);
    queue.enqueue.mockResolvedValue({ id: 'print-job-id' });

    await expect(
      useCase.execute({
        batchId: 'batch-id',
        requestedById: 'admin-id',
      }),
    ).resolves.toBe(existing);

    expect(queue.enqueue).toHaveBeenCalledWith('print-job-id');
    expect(jobs.create).not.toHaveBeenCalled();
  });

  it('persists custom label dimensions and scopes idempotency to the layout', async () => {
    jobs.findByIdempotencyKey.mockResolvedValue(null);
    jobs.create.mockResolvedValue({ id: 'print-job-id' });
    jobs.markQueued.mockResolvedValue({ id: 'print-job-id', status: 'QUEUED' });
    queue.enqueue.mockResolvedValue({ id: 'bull-job-id' });

    await useCase.execute({
      batchId: 'batch-id',
      labelHeightMm: 20,
      labelWidthMm: 40,
      requestedById: 'admin-id',
    });

    expect(jobs.findByIdempotencyKey).toHaveBeenCalledWith(
      'activation-labels-batch-id-1-50-40x20',
    );
    expect(jobs.create).toHaveBeenCalledWith({
      batchId: 'batch-id',
      from: 1,
      idempotencyKey: 'activation-labels-batch-id-1-50-40x20',
      labelHeightMm: 20,
      labelWidthMm: 40,
      requestedById: 'admin-id',
      to: 50,
    });
  });

  it('rejects label dimensions that cannot render legibly in the A4 area', async () => {
    await expect(
      useCase.execute({
        batchId: 'batch-id',
        labelHeightMm: 10,
        labelWidthMm: 20,
        requestedById: 'admin-id',
      }),
    ).rejects.toMatchObject({ code: 'ACTIVATION_LABEL_SIZE_INVALID' });

    expect(jobs.create).not.toHaveBeenCalled();
    expect(queue.enqueue).not.toHaveBeenCalled();
  });
});
