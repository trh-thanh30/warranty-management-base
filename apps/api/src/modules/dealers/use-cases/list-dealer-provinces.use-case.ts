import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListDealerProvincesUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute() {
    const provinces = await this.dealersRepository.listProvinces();

    return provinces.map(({ province }) => province);
  }
}
