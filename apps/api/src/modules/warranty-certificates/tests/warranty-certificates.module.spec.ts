import { WarrantyCertificatesModule } from '@/modules/warranty-certificates/modules/warranty-certificates.module';
import { GetWarrantyCertificateFileForActivationRequestUseCase } from '@/modules/warranty-certificates/use-cases/get-warranty-certificate-file-for-activation-request.use-case';
import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import { MODULE_METADATA } from '@nestjs/common/constants';

describe('WarrantyCertificatesModule', () => {
  it('exports request certificate application APIs without its repository', () => {
    const exportedProviders = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      WarrantyCertificatesModule,
    ) as unknown[];

    expect(exportedProviders).toEqual(
      expect.arrayContaining([
        GetWarrantyCertificateFileForActivationRequestUseCase,
        IssueWarrantyActivationRequestCertificateUseCase,
      ]),
    );
  });
});
