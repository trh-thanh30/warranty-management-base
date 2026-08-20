import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyCertificatesModule } from '@/modules/warranty-certificates/warranty-certificates.module';
import { MODULE_METADATA } from '@nestjs/common/constants';

describe('WarrantyCertificatesModule', () => {
  it('exports the request certificate repository for consuming modules', () => {
    const exportedProviders = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      WarrantyCertificatesModule,
    ) as unknown[];

    expect(exportedProviders).toContain(
      WarrantyActivationRequestCertificatesRepository,
    );
  });
});
