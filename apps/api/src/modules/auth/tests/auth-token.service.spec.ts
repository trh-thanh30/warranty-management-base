import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import jwt from 'jsonwebtoken';

describe('AuthTokenService', () => {
  it('only signs the allowlisted identity fields from a database user', () => {
    const service = new AuthTokenService({
      accessSecret: 'test-access-secret',
      refreshSecret: 'test-refresh-secret',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    });
    const previousRefreshToken = 'x'.repeat(20_000);
    const databaseUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      username: 'admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      password: 'password-hash',
      pin_hash: 'pin-hash',
      refresh_token: previousRefreshToken,
    };
    const tokens = service.generateTokenPair(databaseUser);
    const decoded = jwt.decode(tokens.access_token);

    if (!decoded || typeof decoded === 'string' || !('payload' in decoded)) {
      throw new Error('Expected a JWT payload');
    }

    expect(decoded.payload).toEqual({
      id: 'admin-1',
      email: 'admin@example.com',
      username: 'admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    expect(tokens.access_token.length).toBeLessThan(1_000);
    expect(tokens.refresh_token.length).toBeLessThan(1_000);
  });
});
