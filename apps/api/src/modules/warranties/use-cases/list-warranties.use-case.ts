import { ListWarrantiesDto } from '@/modules/warranties/dto/list-warranties.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyListItemResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';

@Injectable()
export class ListWarrantiesUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
    private readonly activationCodeCryptoService?: ActivationCodeCryptoService,
  ) {}

  async execute(dto: ListWarrantiesDto, actor?: DealerAccessActor) {
    const dealerIds = actor
      ? await this.dealerAccessPolicy!.resolveAccessibleDealerIds(actor)
      : undefined;
    const result = await this.warrantiesRepository.list(
      dealerIds === undefined ? dto : { ...dto, dealerIds },
    );

    return {
      items: result.items.map((warranty) =>
        toWarrantyListItemResponse(
          warranty,
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
