import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { toDealerResponse } from '@/modules/dealers/dealers.types';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { DEALER_MEMBERSHIP_ACCESS_ENABLED } from '@/modules/dealers/dealers.constants';
import type { DealerAccessActor } from '@/modules/dealers/service/dealer-access.policy';
import { Injectable } from '@nestjs/common';
import { user_role } from '@prisma/client';

@Injectable()
export class ListManagedDealersUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(query: ListDealersDto, actor: DealerAccessActor) {
    const assignedUserId =
      DEALER_MEMBERSHIP_ACCESS_ENABLED && actor.role !== user_role.ADMIN
        ? actor.id
        : undefined;
    const result = await this.dealersRepository.list(query, assignedUserId);

    return {
      ...result,
      items: result.items.map(toDealerResponse),
    };
  }
}
