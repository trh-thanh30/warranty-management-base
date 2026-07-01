import { toProductResponse } from '@/modules/products/products.types';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListMyProductsUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(ownerUserId: string) {
    const products =
      await this.warrantiesRepository.listCurrentProductsForUser(ownerUserId);

    return products.map(toProductResponse);
  }
}
