import { NotFoundError } from '@/common/response';
import { DealerAccessActor } from '@/modules/dealers/service/dealer-access.policy';
import { ActivateWarrantyDto } from '@/modules/warranties/dto/activate-warranty.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { ActivateWarrantyUseCase } from '@/modules/warranties/use-cases/activate-warranty.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivateProductWarrantyUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly activateWarrantyUseCase: ActivateWarrantyUseCase,
  ) {}

  async execute(
    productId: string,
    dto: ActivateWarrantyDto,
    context: {
      activatedByUserId?: string;
      actor?: DealerAccessActor;
    } = {},
  ) {
    const warranty = await this.warrantiesRepository.findByProductId(productId);
    if (!warranty) {
      throw new NotFoundError('Warranty not found');
    }

    return this.activateWarrantyUseCase.execute(warranty.id, dto, context);
  }
}
