import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Warranty certificate architecture', () => {
  it('keeps Prisma access behind the warranty certificate repository', () => {
    const moduleRoot = join(__dirname, '..');
    const applicationFiles = [
      'services/warranty-activation-request-certificate-email.service.ts',
      'services/warranty-certificate-email-queue.service.ts',
      'use-cases/cleanup-orphaned-warranty-certificates.use-case.ts',
      'use-cases/delete-warranty-certificate.use-case.ts',
      'use-cases/issue-warranty-activation-request-certificate.use-case.ts',
      'use-cases/issue-warranty-certificate.use-case.ts',
      '../warranty-activation-requests/use-cases/download-warranty-activation-request-certificate.use-case.ts',
      '../../workers/email/worker.processor.ts',
    ];

    for (const relativePath of applicationFiles) {
      const source = readFileSync(join(moduleRoot, relativePath), 'utf8');

      expect(source).not.toContain('PrismaService');
      expect(source).not.toContain('prismaService');
    }
  });
});
