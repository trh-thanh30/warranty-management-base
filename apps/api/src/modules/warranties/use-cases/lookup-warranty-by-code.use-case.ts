import { NotFoundError } from '@/common/response';
import { LookupWarrantyDto } from '@/modules/warranties/dto/lookup-warranty.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyLookupResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LookupWarrantyByCodeUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(dto: LookupWarrantyDto) {
    const code = dto.code.trim().toUpperCase();
    const product =
      await this.warrantiesRepository.findActiveProductByWarrantyCode(code);

    if (!product?.warranty) {
      throw new NotFoundError('Warranty not found');
    }

    return toWarrantyLookupResponse({
      product,
      warranty: product.warranty,
    });
  }
}
