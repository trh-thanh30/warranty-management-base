import { ForbiddenError } from '@/common/response';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { Injectable } from '@nestjs/common';
import { user_role } from '@prisma/client';

export type DealerAccessActor = {
  id: string;
  role: string;
};

@Injectable()
export class DealerAccessPolicy {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async assertCanAccess(actor: DealerAccessActor, dealerId: string) {
    if (actor.role === user_role.ADMIN) return;

    const membership =
      await this.dealersRepository.findMembershipByDealerAndUser(
        dealerId,
        actor.id,
      );
    if (!membership) {
      throw new ForbiddenError(
        'You cannot access this dealer',
        'DEALER_ACCESS_DENIED',
        { dealerId },
      );
    }
  }
}
