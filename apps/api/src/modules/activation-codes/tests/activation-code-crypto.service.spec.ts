import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { ConfigService } from '@nestjs/config';

describe('ActivationCodeCryptoService', () => {
  const service = new ActivationCodeCryptoService(
    new ConfigService({
      activationCode: {
        algorithm: 'aes-256-gcm',
        ivBytes: 12,
        secret: 'test-secret-with-at-least-32-characters',
      },
    }),
  );

  it('hashes normalized codes deterministically with HMAC-SHA-256', () => {
    expect(service.hash(' sp-abcd ')).toBe(service.hash('SP-ABCD'));
    expect(service.hash('SP-ABCD')).toMatch(/^[a-f0-9]{64}$/);
  });

  it('encrypts codes with random IVs and decrypts them', () => {
    const first = service.encrypt('sp-abcd');
    const second = service.encrypt('SP-ABCD');
    expect(first).not.toBe(second);
    expect(service.decrypt(first)).toBe('SP-ABCD');
    expect(service.decrypt(second)).toBe('SP-ABCD');
  });
});
