import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Customers architecture', () => {
  it('keeps create-customer database access behind the repository', () => {
    const source = readFileSync(
      join(__dirname, '../use-cases/create-customer.use-case.ts'),
      'utf8',
    );

    expect(source).not.toContain('PrismaService');
    expect(source).not.toContain('prismaService');
    expect(source).toContain('customersRepository.findUserById');
  });
});
