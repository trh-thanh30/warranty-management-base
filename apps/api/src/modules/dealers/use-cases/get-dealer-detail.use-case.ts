import { NotFoundError } from '@/common/response';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { toDealerResponse } from '@/modules/dealers/dealers.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDealerDetailUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(id: string) {
    const dealer = await this.dealersRepository.findById(id);

    if (!dealer) {
      throw new NotFoundError('Dealer not found');
    }

    return toDealerResponse(dealer);
  }
}
