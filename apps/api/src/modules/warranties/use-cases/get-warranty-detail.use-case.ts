import { NotFoundError } from '@/common/response';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyListItemResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';

@Injectable()
export class GetWarrantyDetailUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
    private readonly activationCodeCryptoService?: ActivationCodeCryptoService,
  ) {}

  async execute(id: string, actor?: DealerAccessActor) {
    const dealerIds = actor
      ? await this.dealerAccessPolicy!.resolveAccessibleDealerIds(actor)
      : undefined;
    const warranty =
      dealerIds === undefined
        ? await this.warrantiesRepository.findById(id)
        : await this.warrantiesRepository.findById(id, dealerIds);

    if (!warranty) {
      throw new NotFoundError('Warranty not found');
    }

    return toWarrantyListItemResponse(
      warranty,
      this.activationCodeCryptoService
        ? (ciphertext) => this.activationCodeCryptoService!.decrypt(ciphertext)
        : undefined,
    );
  }
}
