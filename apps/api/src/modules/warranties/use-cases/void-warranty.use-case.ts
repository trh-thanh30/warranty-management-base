import { VoidWarrantyDto } from '@/modules/warranties/dto/void-warranty.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VoidWarrantyUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly warrantyLifecycleService: WarrantyLifecycleService,
  ) {}

  async execute(
    warrantyId: string,
    dto: VoidWarrantyDto,
    context: { voidedByUserId: string },
  ) {
    const warranty = await this.warrantiesRepository.withTransaction(
      (repository) =>
        this.warrantyLifecycleService.voidWarranty(repository, {
          reason: dto.reason,
          voidedByUserId: context.voidedByUserId,
          warrantyId,
        }),
    );

    return toWarrantyResponse(warranty);
  }
}
