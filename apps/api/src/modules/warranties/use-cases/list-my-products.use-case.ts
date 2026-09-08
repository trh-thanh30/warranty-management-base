import { toProductResponse } from '@/modules/products/products.types';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListMyProductsUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(ownerUserId: string) {
    const warranties =
      await this.warrantiesRepository.listCurrentProductsForUser(ownerUserId);

    return warranties.map((warranty) =>
      toProductResponse({ ...warranty.product, warranty }),
    );
  }
}
