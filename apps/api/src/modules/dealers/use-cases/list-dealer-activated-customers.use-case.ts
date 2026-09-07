import { NotFoundError } from '@/common/response';
import { ListDealerActivatedCustomersDto } from '@/modules/dealers/dto/list-dealer-activated-customers.dto';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { toDealerActivatedCustomerResponse } from '@/modules/dealers/dealers.types';
import { Injectable } from '@nestjs/common';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';

@Injectable()
export class ListDealerActivatedCustomersUseCase {
  constructor(
    private readonly dealersRepository: DealersRepository,
    private readonly dealerAccessPolicy: DealerAccessPolicy,
  ) {}

  async execute(
    dealerId: string,
    query: ListDealerActivatedCustomersDto,
    actor: DealerAccessActor,
  ) {
    await this.dealerAccessPolicy.assertCanAccess(actor, dealerId);
    const dealer = await this.dealersRepository.findById(dealerId);
    if (!dealer) {
      throw new NotFoundError('Dealer not found');
    }

    const result = await this.dealersRepository.listActivatedCustomers(
      dealerId,
      query,
    );

    return {
      ...result,
      items: result.items.map(toDealerActivatedCustomerResponse),
    };
  }
}
