import { EmailProcessor } from '@/workers/email/worker.processor';

describe('EmailProcessor', () => {
  it('marks every certificate in an aggregate email as sent through the application service', async () => {
    const emailService = {
      sendTemplatedEmail: jest.fn().mockResolvedValue(undefined),
    };
    const emailStatusService = {
      markFailed: jest.fn(),
      markSent: jest.fn().mockResolvedValue(undefined),
    };
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
    expect(emailStatusService.markFailed).not.toHaveBeenCalled();
  });

  it('marks certificate email as failed and rethrows so BullMQ can retry', async () => {
    const sendError = new Error('SMTP unavailable');
    const emailService = {
      sendEmail: jest.fn().mockRejectedValue(sendError),
    };
    const emailStatusService = {
      markFailed: jest.fn().mockResolvedValue(undefined),
      markSent: jest.fn(),
    };
    const processor = new EmailProcessor(
      emailService as never,
      emailStatusService as never,
    );
    const job = {
      data: {
        subject: 'Warranty certificate',
        text: 'Certificate attached',
        to: 'customer@example.com',
        warrantyCertificateId: 'certificate-1',
      },
      id: 'job-id',
      updateProgress: jest.fn(),
    };

    await expect(processor.process(job as never)).rejects.toBe(sendError);

    expect(emailStatusService.markFailed).toHaveBeenCalledWith(
      ['certificate-1'],
      'SMTP unavailable',
    );
    expect(emailStatusService.markSent).not.toHaveBeenCalled();
  });
});
