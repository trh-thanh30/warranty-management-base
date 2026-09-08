import { NotFoundError } from '@/common/response';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RemoveDealerMemberUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(dealerId: string, membershipId: string) {
    const existing = await this.dealersRepository.findMembershipById(
      dealerId,
      membershipId,
    );
    if (!existing) {
      throw new NotFoundError(
        'Dealer membership not found',
        'DEALER_MEMBERSHIP_NOT_FOUND',
      );
    }

    await this.dealersRepository.deleteMembership(membershipId);
    return { id: membershipId };
  }
}
