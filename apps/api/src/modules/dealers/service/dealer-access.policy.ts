import { ForbiddenError } from '@/common/response';
import { DEALER_MEMBERSHIP_ACCESS_ENABLED } from '@/modules/dealers/dealers.constants';
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
    if (!DEALER_MEMBERSHIP_ACCESS_ENABLED || actor.role === user_role.ADMIN) {
      return;
    }

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

  async resolveAccessibleDealerIds(
    actor: DealerAccessActor,
  ): Promise<string[] | undefined> {
    if (!DEALER_MEMBERSHIP_ACCESS_ENABLED || actor.role === user_role.ADMIN) {
      return undefined;
    }

    const dealers = await this.dealersRepository.listAssignedToUser(actor.id);
    return dealers.map((dealer) => dealer.id);
  }

  async assertCanAccessRecord(
    actor: DealerAccessActor,
    dealerId: string | null | undefined,
  ) {
    if (!DEALER_MEMBERSHIP_ACCESS_ENABLED || actor.role === user_role.ADMIN) {
      return;
    }
    if (!dealerId) {
      throw new ForbiddenError(
        'This record is not assigned to an accessible dealer',
        'DEALER_ACCESS_DENIED',
      );
    }
    await this.assertCanAccess(actor, dealerId);
  }
}
