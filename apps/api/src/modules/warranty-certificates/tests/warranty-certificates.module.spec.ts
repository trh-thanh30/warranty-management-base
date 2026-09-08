import { WarrantyCertificatesModule } from '@/modules/warranty-certificates/modules/warranty-certificates.module';
import { HtmlPdfRendererService } from '@/modules/warranty-certificates/services/html-pdf-renderer.service';
import { GetWarrantyCertificateFileForActivationRequestUseCase } from '@/modules/warranty-certificates/use-cases/get-warranty-certificate-file-for-activation-request.use-case';
import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import { MODULE_METADATA } from '@nestjs/common/constants';

describe('WarrantyCertificatesModule', () => {
  it('owns the PDF renderer service that it exports', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      WarrantyCertificatesModule,
    ) as unknown[];
    const exportedProviders = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      WarrantyCertificatesModule,
    ) as unknown[];

    expect(providers).toContain(HtmlPdfRendererService);
    expect(exportedProviders).toContain(HtmlPdfRendererService);
  });

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
