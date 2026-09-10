import { toDealerResponse } from '@/modules/dealers/dealers.types';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListAssignedDealersUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(userId: string) {
    const dealers = await this.dealersRepository.listAssignedToUser(userId);
    return dealers.map(toDealerResponse);
  }
}
