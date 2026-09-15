import activationCodeConfig from '@/config/activation-code.config';
import { envSchema } from '@/config/env.validation';

describe('activationCodeConfig print template version', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reads the configured version from the environment', () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      ACTIVATION_LABEL_TEMPLATE_VERSION: '3',
    });

    expect(activationCodeConfig().printTemplateVersion).toBe(3);
  });

  it('defaults to version 2 for existing deployments', () => {
    const environment = { ...process.env };
    delete environment.ACTIVATION_LABEL_TEMPLATE_VERSION;
    jest.replaceProperty(process, 'env', environment);

    expect(activationCodeConfig().printTemplateVersion).toBe(2);
  });

  it.each(['0', '-1', '2.5', 'invalid'])(
    'rejects an invalid template version %s at startup',
    (version) => {
      const result = envSchema.safeParse({
        ACTIVATION_LABEL_TEMPLATE_VERSION: version,
        DATABASE_URL: 'postgresql://localhost:5432/test',
        EMAIL_FROM: 'admin@example.com',
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_SECRET: 'test-secret',
        REDIS_URL: 'redis://localhost:6379',
        SMTP_PASS: 'test-password',
        SMTP_USER: 'admin@example.com',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['ACTIVATION_LABEL_TEMPLATE_VERSION'],
            }),
          ]),
        );
      }
    },
  );
});
