import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { toDealerResponse } from '@/modules/dealers/dealers.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListDealersUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(query: ListDealersDto) {
    const result = await this.dealersRepository.list(query);

    return {
      ...result,
      items: result.items.map(toDealerResponse),
    };
  }
}
