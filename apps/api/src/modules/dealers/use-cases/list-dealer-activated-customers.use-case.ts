import { NotFoundError } from '@/common/response';
import { ListDealerActivatedCustomersDto } from '@/modules/dealers/dto/list-dealer-activated-customers.dto';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { toDealerActivatedCustomerResponse } from '@/modules/dealers/dealers.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListDealerActivatedCustomersUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(dealerId: string, query: ListDealerActivatedCustomersDto) {
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
