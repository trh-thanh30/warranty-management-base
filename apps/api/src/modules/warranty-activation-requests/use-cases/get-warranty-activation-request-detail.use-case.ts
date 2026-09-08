import { NotFoundError } from '@/common/response';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable, Optional } from '@nestjs/common';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';

@Injectable()
export class GetWarrantyActivationRequestDetailUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
    @Optional()
    private readonly activationCodeCryptoService?: ActivationCodeCryptoService,
  ) {}

  async execute(id: string, actor?: DealerAccessActor) {
    const dealerIds = actor
      ? await this.dealerAccessPolicy!.resolveAccessibleDealerIds(actor)
      : undefined;
    const request =
      dealerIds === undefined
        ? await this.warrantyActivationRequestsRepository.findById(id)
        : await this.warrantyActivationRequestsRepository.findById(
            id,
            dealerIds,
          );

    if (!request) {
      throw new NotFoundError('Warranty activation request not found');
    }

    return toWarrantyActivationRequestResponse(
      request,
      this.activationCodeCryptoService
        ? (ciphertext) => this.activationCodeCryptoService!.decrypt(ciphertext)
        : undefined,
    );
  }
}
