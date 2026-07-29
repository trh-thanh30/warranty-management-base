import { requireSeedPassword } from '../../../prisma/seed-env';

describe('Seed environment', () => {
  it('returns a configured seed password without modifying it', () => {
    expect(
      requireSeedPassword('SEED_ADMIN_PASSWORD', {
        SEED_ADMIN_PASSWORD: ' secure-password ',
      }),
    ).toBe(' secure-password ');
  });

  it('rejects a missing seed password', () => {
    expect(() => requireSeedPassword('SEED_ADMIN_PASSWORD', {})).toThrow(
      'SEED_ADMIN_PASSWORD is required to seed login users',
    );
  });

  it('rejects a seed password shorter than the auth minimum', () => {
    expect(() =>
      requireSeedPassword('SEED_ADMIN_PASSWORD', {
        SEED_ADMIN_PASSWORD: 'short',
      }),
    ).toThrow('SEED_ADMIN_PASSWORD must contain at least 8 characters');
  });
});
