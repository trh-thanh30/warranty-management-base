import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WarrantyCertificateEmailStatusService {
  constructor(
    private readonly warrantyCertificatesRepository: WarrantyCertificatesRepository,
    private readonly requestCertificatesRepository: WarrantyActivationRequestCertificatesRepository,
  ) {}

  async markSent(certificateIds: string[]): Promise<void> {
    const ids = uniqueIds(certificateIds);
    if (ids.length === 0) return;

    await this.warrantyCertificatesRepository.markEmailSent(ids, new Date());
  }

  async markFailed(certificateIds: string[], message: string): Promise<void> {
    const ids = uniqueIds(certificateIds);
    if (ids.length === 0) return;

    await this.warrantyCertificatesRepository.markEmailFailed(ids, message);
  }

  async markRequestSent(certificateId?: string): Promise<void> {
    if (!certificateId) return;

    await this.requestCertificatesRepository.markEmailSent(
      certificateId,
      new Date(),
    );
  }

  async markRequestFailed(
    certificateId: string | undefined,
    message: string,
  ): Promise<void> {
    if (!certificateId) return;

    await this.requestCertificatesRepository.markEmailFailed(
      certificateId,
      message,
    );
  }
}

function uniqueIds(certificateIds: string[]) {
  return [...new Set(certificateIds)];
}
