import clientConfig from '@/config/client.config';
import emailConfig from '@/config/email.config';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyCertificatesModule } from '@/modules/warranty-certificates/modules/warranty-certificates.module';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyActivationRequestCertificateEmailService } from '@/modules/warranty-certificates/services/warranty-activation-request-certificate-email.service';
import type { DynamicModule } from '@nestjs/common';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';

describe('WarrantyCertificatesModule client config wiring', () => {
  afterEach(() => jest.restoreAllMocks());

  it('resolves the email service from its own config registration without AppModule', async () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      CLIENT_WARRANTY_LOOKUP_URL: 'https://portal.example.com/warranty/lookup',
    });
    const imports: unknown = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      WarrantyCertificatesModule,
    );
    if (!Array.isArray(imports)) throw new Error('Module imports are missing');
    const registration = imports.find(isClientRegistration);
    if (!isClientRegistration(registration)) {
      throw new Error(
        'WarrantyCertificatesModule must register client config locally',
      );
    }

    const module = await Test.createTestingModule({
      imports: [registration],
      providers: [
        WarrantyActivationRequestCertificateEmailService,
        {
          provide: WarrantyActivationRequestCertificatesRepository,
          useValue: {},
        },
        { provide: SendEmailUseCase, useValue: {} },
        { provide: UploadAssetService, useValue: {} },
        { provide: emailConfig.KEY, useValue: {} },
      ],
    }).compile();
    try {
      expect(
        module.get(WarrantyActivationRequestCertificateEmailService),
      ).toBeInstanceOf(WarrantyActivationRequestCertificateEmailService);
      expect(
        module.get<ReturnType<typeof clientConfig>>(clientConfig.KEY)
          .warrantyLookupUrl,
      ).toBe('https://portal.example.com/warranty/lookup');
    } finally {
      await module.close();
    }
  });
});

function isClientRegistration(value: unknown): value is DynamicModule {
  return (
    typeof value === 'object' &&
    value !== null &&
    'module' in value &&
    'providers' in value &&
    Array.isArray(value.providers) &&
    value.providers.some(
      (provider: unknown) =>
        typeof provider === 'object' &&
        provider !== null &&
        'provide' in provider &&
        provider.provide === clientConfig.KEY,
    )
  );
}
