import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WarrantyCertificateEmailStatusService {
  constructor(
    private readonly warrantyCertificatesRepository: WarrantyCertificatesRepository,
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
}

function uniqueIds(certificateIds: string[]) {
  return [...new Set(certificateIds)];
}
