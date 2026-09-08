import { NotFoundError } from '@/common/response';
import {
  DealerAccessActor,
  DealerAccessPolicy,
} from '@/modules/dealers/service/dealer-access.policy';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetWarrantyByProductUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(productId: string, actor?: DealerAccessActor) {
    const dealerIds = actor
      ? await this.dealerAccessPolicy!.resolveAccessibleDealerIds(actor)
      : undefined;
    const warranty =
      dealerIds === undefined
        ? await this.warrantiesRepository.findRecordByProductId(productId)
        : await this.warrantiesRepository.findRecordByProductId(
            productId,
            dealerIds,
          );
    if (!warranty) {
      throw new NotFoundError('Warranty not found');
    }

    return toWarrantyResponse(warranty);
  }
}
