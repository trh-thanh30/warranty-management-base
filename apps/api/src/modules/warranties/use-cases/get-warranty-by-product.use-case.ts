import { NotFoundError } from '@/common/response';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetWarrantyByProductUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(productId: string) {
    const warranty =
      await this.warrantiesRepository.findRecordByProductId(productId);
    if (!warranty) {
      throw new NotFoundError('Warranty not found');
    }

    return toWarrantyResponse(warranty);
  }
}
