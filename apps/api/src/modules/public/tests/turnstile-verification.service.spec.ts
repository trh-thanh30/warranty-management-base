import { TurnstileVerificationService } from '@/modules/public/service/turnstile-verification.service';

describe('TurnstileVerificationService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('rejects an invalid Turnstile response when protection is configured', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      ),
    );
    const service = new TurnstileVerificationService({
      dailyCodeLimit: 3,
      dailyIpLimit: 20,
      dailyPhoneLimit: 5,
      dailyWindowSeconds: 86_400,
      turnstileSecretKey: 'secret-key',
    });

    await expect(
      service.verify({ ip: '203.0.113.10', token: 'invalid-token' }),
    ).rejects.toMatchObject({
      code: 'TURNSTILE_VERIFICATION_FAILED',
      statusCode: 400,
    });
  });
});
