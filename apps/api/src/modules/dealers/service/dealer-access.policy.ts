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

  async resolveAccessibleDealerIds(
    actor: DealerAccessActor,
  ): Promise<string[] | undefined> {
    if (actor.role === user_role.ADMIN) return undefined;

    const dealers = await this.dealersRepository.listAssignedToUser(actor.id);
    return dealers.map((dealer) => dealer.id);
  }

  async assertCanAccessRecord(
    actor: DealerAccessActor,
    dealerId: string | null | undefined,
  ) {
    if (actor.role === user_role.ADMIN) return;
    if (!dealerId) {
      throw new ForbiddenError(
        'This record is not assigned to an accessible dealer',
        'DEALER_ACCESS_DENIED',
      );
    }
    await this.assertCanAccess(actor, dealerId);
  }
}
