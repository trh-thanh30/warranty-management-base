import { ContactSubmissionsController } from '@/modules/contact-submissions/contact-submissions.controller';
import { ContactSubmissionTurnstileGuard } from '@/modules/contact-submissions/guards/contact-submission-turnstile.guard';
import { TurnstileVerificationService } from '@/modules/public-submission-protection/service/turnstile-verification.service';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

function createContext(headers: Record<string, string>): ExecutionContextHost {
  const context = new ExecutionContextHost([
    { headers, ip: '203.0.113.10', socket: {} },
  ]);
  context.setType('http');
  return context;
}

describe('ContactSubmissionTurnstileGuard', () => {
  it('protects the public contact submission endpoint', () => {
    const method: unknown = Object.getOwnPropertyDescriptor(
      ContactSubmissionsController.prototype,
      'create',
    )?.value;
    expect(typeof method).toBe('function');
    if (typeof method !== 'function') return;
    const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, method);

    expect(guards).toContain(ContactSubmissionTurnstileGuard);
  });

  it('verifies the token from the same header used by warranty forms', async () => {
    const service = new TurnstileVerificationService({
      dailyCodeLimit: 3,
      dailyIpLimit: 20,
      dailyPhoneLimit: 5,
      dailyWindowSeconds: 86_400,
      turnstileSecretKey: '',
    });
    const verify = jest.spyOn(service, 'verify').mockResolvedValue(undefined);
    const guard = new ContactSubmissionTurnstileGuard(service);

    await expect(
      guard.canActivate(createContext({ 'x-turnstile-token': 'test-token' })),
    ).resolves.toBe(true);
    expect(verify).toHaveBeenCalledWith({
      ip: '203.0.113.10',
      token: 'test-token',
    });
  });

  it('rejects submissions without a token when Turnstile is configured', async () => {
    const service = new TurnstileVerificationService({
      dailyCodeLimit: 3,
      dailyIpLimit: 20,
      dailyPhoneLimit: 5,
      dailyWindowSeconds: 86_400,
      turnstileSecretKey: 'secret-key',
    });
    const guard = new ContactSubmissionTurnstileGuard(service);

    await expect(guard.canActivate(createContext({}))).rejects.toMatchObject({
      code: 'TURNSTILE_TOKEN_REQUIRED',
      statusCode: 400,
    });
  });
});
