import { NotFoundError } from '@/common/response';
import { ActivateWarrantyByCodeDto } from '@/modules/warranties/dto/activate-warranty-by-code.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { ActivateWarrantyUseCase } from '@/modules/warranties/use-cases/activate-warranty.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivateWarrantyByCodeUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly activateWarrantyUseCase: ActivateWarrantyUseCase,
  ) {}

  async execute(
    dto: ActivateWarrantyByCodeDto,
    context: { activatedByUserId?: string } = {},
  ) {
    const code = dto.warrantyCode.trim().toUpperCase();
    const product =
      await this.warrantiesRepository.findActiveProductByWarrantyCode(code);

    if (!product?.warranty) throw new NotFoundError('Warranty not found');

    return this.activateWarrantyUseCase.execute(
      product.warranty.id,
      dto,
      context,
    );
  }
}
