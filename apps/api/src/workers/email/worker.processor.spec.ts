import { EmailProcessor } from '@/workers/email/worker.processor';

describe('EmailProcessor', () => {
  it('marks every legacy certificate in an aggregate email as sent', async () => {
    const emailService = {
      sendTemplatedEmail: jest.fn().mockResolvedValue(undefined),
    };
    const emailStatusService = createEmailStatusService();
    const processor = new EmailProcessor(
      emailService as never,
      emailStatusService as never,
    );
    const job = {
      data: {
        context: {},
        template: 'warranty-certificates',
        to: 'customer@example.com',
        warrantyCertificateIds: ['certificate-1', 'certificate-2'],
      },
      id: 'job-id',
      updateProgress: jest.fn(),
    };

    await processor.process(job as never);

    expect(emailStatusService.markSent).toHaveBeenCalledWith([
      'certificate-1',
      'certificate-2',
    ]);
    expect(emailStatusService.markRequestSent).toHaveBeenCalledWith(undefined);
    expect(emailStatusService.markFailed).not.toHaveBeenCalled();
  });

  it('marks a request-owned aggregate certificate as sent', async () => {
    const emailService = {
      sendTemplatedEmail: jest.fn().mockResolvedValue(undefined),
    };
    const emailStatusService = createEmailStatusService();
    const processor = new EmailProcessor(
      emailService as never,
      emailStatusService as never,
    );
    const job = {
      data: {
        context: {},
        template: 'warranty-certificates',
        to: 'customer@example.com',
        warrantyActivationRequestCertificateId: 'request-certificate-1',
      },
      id: 'request-certificate-job',
      updateProgress: jest.fn(),
    };

    await processor.process(job as never);

    expect(emailStatusService.markSent).toHaveBeenCalledWith([]);
    expect(emailStatusService.markRequestSent).toHaveBeenCalledWith(
      'request-certificate-1',
    );
    expect(emailStatusService.markRequestFailed).not.toHaveBeenCalled();
  });

  it('marks request certificate email as failed and rethrows for BullMQ retry', async () => {
    const sendError = new Error('SMTP unavailable');
    const emailService = {
      sendEmail: jest.fn().mockRejectedValue(sendError),
    };
    const emailStatusService = createEmailStatusService();
    const processor = new EmailProcessor(
      emailService as never,
      emailStatusService as never,
    );
    const job = {
      data: {
        subject: 'Warranty certificate',
        text: 'Certificate attached',
        to: 'customer@example.com',
        warrantyActivationRequestCertificateId: 'request-certificate-1',
      },
      id: 'job-id',
      updateProgress: jest.fn(),
    };

    await expect(processor.process(job as never)).rejects.toBe(sendError);

    expect(emailStatusService.markFailed).toHaveBeenCalledWith(
      [],
      'SMTP unavailable',
    );
    expect(emailStatusService.markRequestFailed).toHaveBeenCalledWith(
      'request-certificate-1',
      'SMTP unavailable',
    );
    expect(emailStatusService.markRequestSent).not.toHaveBeenCalled();
  });

  it('does not suppress a retry when sent persistence fails', async () => {
    const emailService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };
    const emailStatusService = createEmailStatusService();
    emailStatusService.markSent.mockRejectedValueOnce(
      new Error('Database unavailable'),
    );
    const processor = new EmailProcessor(
      emailService as never,
      emailStatusService as never,
    );
    const job = {
      data: {
        idempotencyKey: 'certificate-email:certificate-1',
        subject: 'Warranty certificate',
        text: 'Certificate attached',
        to: 'customer@example.com',
        warrantyCertificateIds: ['certificate-1'],
      },
      id: 'job-id',
      updateProgress: jest.fn(),
    };

    await expect(processor.process(job as never)).rejects.toThrow(
      'Database unavailable',
    );
    await processor.process(job as never);

    expect(emailService.sendEmail).toHaveBeenCalledTimes(2);
    expect(emailStatusService.markSent).toHaveBeenCalledTimes(2);
  });
});

function createEmailStatusService() {
  return {
    markFailed: jest.fn().mockResolvedValue(undefined),
    markRequestFailed: jest.fn().mockResolvedValue(undefined),
    markRequestSent: jest.fn().mockResolvedValue(undefined),
    markSent: jest.fn().mockResolvedValue(undefined),
  };
}
