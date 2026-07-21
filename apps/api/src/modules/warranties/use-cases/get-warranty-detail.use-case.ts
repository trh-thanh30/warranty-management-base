import { NotFoundError } from '@/common/response';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyListItemResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetWarrantyDetailUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(id: string) {
    const warranty = await this.warrantiesRepository.findById(id);

    if (!warranty) {
      throw new NotFoundError('Warranty not found');
    }

    return toWarrantyListItemResponse(warranty);
  }
}
