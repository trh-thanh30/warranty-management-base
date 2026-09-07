import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { toDealerResponse } from '@/modules/dealers/dealers.types';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import type { DealerAccessActor } from '@/modules/dealers/service/dealer-access.policy';
import { Injectable } from '@nestjs/common';
import { user_role } from '@prisma/client';

@Injectable()
export class ListManagedDealersUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(query: ListDealersDto, actor: DealerAccessActor) {
    const assignedUserId =
      actor.role === user_role.ADMIN ? undefined : actor.id;
    const result = await this.dealersRepository.list(query, assignedUserId);

    return {
      ...result,
      items: result.items.map(toDealerResponse),
    };
  }
}
