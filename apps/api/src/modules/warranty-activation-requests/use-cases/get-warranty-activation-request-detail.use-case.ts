import { NotFoundError } from '@/common/response';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetWarrantyActivationRequestDetailUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
  ) {}

  async execute(id: string) {
    const request =
      await this.warrantyActivationRequestsRepository.findById(id);

    if (!request) {
      throw new NotFoundError('Warranty activation request not found');
    }

    return toWarrantyActivationRequestResponse(request);
  }
}
