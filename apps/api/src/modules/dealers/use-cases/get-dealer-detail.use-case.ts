import { NotFoundError } from '@/common/response';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { toDealerResponse } from '@/modules/dealers/dealers.types';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDealerDetailUseCase {
  constructor(
    private readonly dealersRepository: DealersRepository,
    private readonly dealerAccessPolicy: DealerAccessPolicy,
  ) {}

  async execute(id: string, actor: DealerAccessActor) {
    await this.dealerAccessPolicy.assertCanAccess(actor, id);
    const dealer = await this.dealersRepository.findById(id);

    if (!dealer) {
      throw new NotFoundError('Dealer not found');
    }

    return toDealerResponse(dealer);
  }
}
