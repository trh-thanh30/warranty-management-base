import { ActivationCodeExpirySchedulerService } from '@/modules/activation-codes/services/activation-code-expiry-scheduler.service';

describe('ActivationCodeExpirySchedulerService', () => {
  it('registers an enabled cron and delegates execution', async () => {
    const schedulerRegistry = { addCronJob: jest.fn() };
    const expireUseCase = {
      execute: jest.fn().mockResolvedValue({ batches: 1, expired: 4 }),
    };
    const service = new ActivationCodeExpirySchedulerService(
      schedulerRegistry as never,
      expireUseCase as never,
      {
        timezone: 'UTC',
        activationCodeExpiry: {
          enabled: true,
          cron: '* * * * *',
          batchSize: 10,
        },
      } as never,
    );

    service.onModuleInit();
    const job = schedulerRegistry.addCronJob.mock.calls[0]?.[1] as {
      fireOnTick: () => Promise<void>;
      start: () => void;
      stop: () => void;
    };
    expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
      'activation-code-expiry',
      expect.anything(),
    );

    await service.run();
    expect(expireUseCase.execute).toHaveBeenCalledWith({ batchSize: 10 });
    expect(job.start).toEqual(expect.any(Function));
    job.stop();
  });

  it('does not register a cron when disabled', () => {
    const schedulerRegistry = { addCronJob: jest.fn() };
    const service = new ActivationCodeExpirySchedulerService(
      schedulerRegistry as never,
      { execute: jest.fn() } as never,
      { activationCodeExpiry: { enabled: false } } as never,
    );

    service.onModuleInit();
    expect(schedulerRegistry.addCronJob).not.toHaveBeenCalled();
  });
});
