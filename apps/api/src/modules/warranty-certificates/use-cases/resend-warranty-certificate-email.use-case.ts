import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResendWarrantyCertificateEmailUseCase {
  constructor(
    private readonly certificateEmailQueueService: WarrantyCertificateEmailQueueService,
  ) {}

  execute(certificateId: string) {
    return this.certificateEmailQueueService.queueEmail(certificateId);
  }
}
