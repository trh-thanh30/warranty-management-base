import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { SendForgotPasswordEmailUseCase } from '@/modules/email/use-cases/send-forgot-password-email.usecase';
import { SendVerificationEmailUseCase } from '@/modules/email/use-cases/send-verification-email.usecase';

describe('email use cases', () => {
  it('queues a plain email with idempotency key', async () => {
    const emailService = { sendJob: jest.fn().mockResolvedValue(undefined) };
    const useCase = new SendEmailUseCase(emailService as any);

    await useCase.execute({
      to: 'user@example.com',
      subject: 'Subject',
      text: 'Body',
      html: '<p>Body</p>',
    });

    expect(emailService.sendJob).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Subject',
      text: 'Body',
      html: '<p>Body</p>',
      idempotencyKey: 'email:user@example.com:Subject',
    });
  });

  it('queues verification email and converts ttl to minutes', async () => {
    const emailService = { sendJob: jest.fn().mockResolvedValue(undefined) };
    const useCase = new SendVerificationEmailUseCase(emailService as any);

    await useCase.execute({
      to: 'user@example.com',
      code: '123456',
      ttl: 15 * 60_000,
    });

    expect(emailService.sendJob).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        template: 'verification',
        idempotencyKey: 'verification:user@example.com:123456',
        context: expect.objectContaining({
          to: 'user@example.com',
          code: '123456',
          ttl: 15,
          subject: 'Verify your email to complete registration',
        }),
      }),
    );
  });

  it('queues forgot password email with ISO expiry', async () => {
    const emailService = { sendJob: jest.fn().mockResolvedValue(undefined) };
    const useCase = new SendForgotPasswordEmailUseCase(emailService as any);
    const ttl = new Date('2026-01-02T03:04:05.000Z');

    await useCase.execute({
      to: 'user@example.com',
      code: '654321',
      ttl,
    });

    expect(emailService.sendJob).toHaveBeenCalledWith({
      to: 'user@example.com',
      template: 'forgot-password',
      context: {
        code: '654321',
        ttl: '2026-01-02T03:04:05.000Z',
        subject: 'Reset your password',
      },
      idempotencyKey: 'forgot-password:user@example.com:654321',
    });
  });
});
