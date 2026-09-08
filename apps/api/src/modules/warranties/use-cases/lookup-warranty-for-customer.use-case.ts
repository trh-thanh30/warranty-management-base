import { NotFoundError } from '@/common/response';
import { LookupWarrantyDto } from '@/modules/warranties/dto/lookup-warranty.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyLookupResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

const LOOKUP_NOT_FOUND_MESSAGE =
  'Không tìm thấy sản phẩm phù hợp với tài khoản này.';

@Injectable()
export class LookupWarrantyForCustomerUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(ownerUserId: string, dto: LookupWarrantyDto) {
    const code = dto.code.trim().toUpperCase();
    const warranty = await this.warrantiesRepository.findLookupMatchForCustomer(
      code,
      ownerUserId,
    );

    if (!warranty) {
      throw new NotFoundError(LOOKUP_NOT_FOUND_MESSAGE);
    }

    return toWarrantyLookupResponse({
      product: warranty.product,
      warranty,
    });
  }
}
