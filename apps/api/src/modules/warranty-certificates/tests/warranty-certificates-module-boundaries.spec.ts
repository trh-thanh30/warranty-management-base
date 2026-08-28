import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyCertificateEmailStatusService } from '@/modules/warranty-certificates/services/warranty-certificate-email-status.service';
import { GetWarrantyCertificateFileForActivationRequestUseCase } from '@/modules/warranty-certificates/use-cases/get-warranty-certificate-file-for-activation-request.use-case';
import { WarrantyCertificateEmailStatusModule } from '@/modules/warranty-certificates/warranty-certificate-email-status.module';
import { WarrantyCertificatesModule } from '@/modules/warranty-certificates/warranty-certificates.module';
import { EmailProcessor } from '@/workers/email/worker.processor';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Warranty certificate module boundaries', () => {
  it('exposes email status transitions without exporting the repository', () => {
    const providers = getModuleMetadata(
      WarrantyCertificateEmailStatusModule,
      MODULE_METADATA.PROVIDERS,
    );
    const exports = getModuleMetadata(
      WarrantyCertificateEmailStatusModule,
      MODULE_METADATA.EXPORTS,
    );

    expect(providers).toEqual(
      expect.arrayContaining([
        WarrantyCertificatesRepository,
        WarrantyCertificateEmailStatusService,
      ]),
    );
    expect(exports).toContain(WarrantyCertificateEmailStatusService);
    expect(exports).not.toContain(WarrantyCertificatesRepository);
  });

  it('makes the worker depend on the public email status module', () => {
    setRequiredWorkerEnvironment();
    const { WorkerModule } = jest.requireActual<
      typeof import('@/workers/email/worker.module')
    >('@/workers/email/worker.module');
    const imports = getModuleMetadata(WorkerModule, MODULE_METADATA.IMPORTS);
    const providers = getModuleMetadata(
      WorkerModule,
      MODULE_METADATA.PROVIDERS,
    );

    expect(imports).toContain(WarrantyCertificateEmailStatusModule);
    expect(providers).toContain(EmailProcessor);
    expect(providers).not.toContain(WarrantyCertificatesRepository);
  });

  it('exports application APIs instead of the certificate repository', () => {
    const exports = getModuleMetadata(
      WarrantyCertificatesModule,
      MODULE_METADATA.EXPORTS,
    );

    expect(exports).toEqual(
      expect.arrayContaining([
        GetWarrantyCertificateFileForActivationRequestUseCase,
        WarrantyCertificateEmailStatusModule,
      ]),
    );
    expect(exports).not.toContain(WarrantyCertificatesRepository);
  });

  it('keeps request certificate persistence details inside its repository', () => {
    const applicationSource = [
      '../use-cases/issue-warranty-activation-request-certificate.use-case.ts',
      '../services/warranty-activation-request-certificate-email.service.ts',
    ]
      .map((relativePath) =>
        readFileSync(join(__dirname, relativePath), 'utf8'),
      )
      .join('\n');
    const repositorySource = readFileSync(
      join(
        __dirname,
        '../repository/warranty-activation-request-certificates.repository.ts',
      ),
      'utf8',
    );

    expect(applicationSource).not.toContain('@prisma/client');
    expect(applicationSource).not.toMatch(
      /\b(?:activation_request_id|certificate_number|email_status|recipient_email|storage_key)\b/,
    );
    expect(repositorySource).toContain('@prisma/client');
    expect(repositorySource).toContain('toRequestCertificateRecord');
  });
});

function setRequiredWorkerEnvironment() {
  process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_ACCESS_SECRET ??= 'test-access-secret';
  process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret';
  process.env.JWT_SECRET ??= 'test-secret';
  process.env.SMTP_USER ??= 'test@example.com';
  process.env.SMTP_PASS ??= 'test-password';
  process.env.EMAIL_FROM ??= 'test@example.com';
  process.env.REDIS_URL ??= 'redis://localhost:6379';
}

function getModuleMetadata(module: object, metadataKey: string): unknown[] {
  return (
    (Reflect.getMetadata(metadataKey, module) as unknown[] | undefined) ?? []
  );
}
