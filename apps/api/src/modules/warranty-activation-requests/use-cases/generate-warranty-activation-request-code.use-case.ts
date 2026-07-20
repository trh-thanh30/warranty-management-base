import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateWarrantyActivationRequestCodeUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
  ) {}

  async execute(date = new Date()) {
    const prefix = `WAR-${formatDatePart(date)}-`;
    const lastRequest =
      await this.warrantyActivationRequestsRepository.findLastRequestCode(
        prefix,
      );
    const lastSequence = lastRequest?.request_code
      ? Number(lastRequest.request_code.slice(prefix.length))
      : 0;

    return `${prefix}${String(lastSequence + 1).padStart(4, '0')}`;
  }
}

function formatDatePart(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}
