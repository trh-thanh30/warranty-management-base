import { NotFoundError } from '@/common/response';
import { DealerAccessActor } from '@/modules/dealers/service/dealer-access.policy';
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
    context: {
      activatedByUserId?: string;
      actor?: DealerAccessActor;
    } = {},
  ) {
    const code = dto.warrantyCode.trim().toUpperCase();
    const warranty = await this.warrantiesRepository.findByWarrantyCode(code);

    if (!warranty) throw new NotFoundError('Warranty not found');

    return this.activateWarrantyUseCase.execute(warranty.id, dto, context);
  }
}
