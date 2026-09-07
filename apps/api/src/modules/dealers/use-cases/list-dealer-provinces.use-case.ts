import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { Injectable } from '@nestjs/common';
import type { DealerAccessActor } from '@/modules/dealers/service/dealer-access.policy';
import { user_role } from '@prisma/client';

@Injectable()
export class ListDealerProvincesUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(actor: DealerAccessActor) {
    const assignedUserId =
      actor.role === user_role.ADMIN ? undefined : actor.id;
    const provinces =
      await this.dealersRepository.listProvinces(assignedUserId);

    return provinces.map(({ province }) => province);
  }
}
