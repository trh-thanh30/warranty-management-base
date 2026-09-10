import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable } from '@nestjs/common';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';

@Injectable()
export class ListWarrantyActivationRequestsUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
    private readonly activationCodeCryptoService?: ActivationCodeCryptoService,
  ) {}

  async execute(
    filters: ListWarrantyActivationRequestsDto,
    actor?: DealerAccessActor,
  ) {
    const dealerIds = actor
      ? await this.dealerAccessPolicy!.resolveAccessibleDealerIds(actor)
      : undefined;
    const result =
      dealerIds === undefined
        ? await this.warrantyActivationRequestsRepository.list(filters)
        : await this.warrantyActivationRequestsRepository.list(
            filters,
            dealerIds,
          );

    return {
      items: result.items.map((request) =>
        toWarrantyActivationRequestResponse(
          request,
          this.activationCodeCryptoService
            ? (ciphertext) =>
                this.activationCodeCryptoService!.decrypt(ciphertext)
            : undefined,
        ),
      ),
      meta: result.meta,
    };
  }
}
