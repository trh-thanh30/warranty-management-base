import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { Injectable } from '@nestjs/common';
import type { PublicDealerFilterOptions } from '@repo/shared';

@Injectable()
export class PublicListDealerFilterOptionsUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(province?: string): Promise<PublicDealerFilterOptions> {
    const result =
      await this.dealersRepository.listActiveFilterOptions(province);

    return {
      provinces: result.provinces
        .map(({ province: value }) => value)
        .sort((left, right) => left.localeCompare(right, 'vi')),
      districts: result.districts
        .flatMap(({ district }) => (district ? [district] : []))
        .sort((left, right) => left.localeCompare(right, 'vi')),
    };
  }
}
