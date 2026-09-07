import { NotFoundError } from '@/common/response';
import { toDealerMembershipResponse } from '@/modules/dealers/dealers.types';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListDealerMembersUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(dealerId: string) {
    const dealer = await this.dealersRepository.findById(dealerId);
    if (!dealer) {
      throw new NotFoundError('Dealer not found', 'DEALER_NOT_FOUND');
    }

    const memberships = await this.dealersRepository.listMemberships(dealerId);
    return memberships.map(toDealerMembershipResponse);
  }
}
