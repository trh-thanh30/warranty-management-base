import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { ActivateWarrantyDto } from '@/modules/warranties/dto/activate-warranty.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';

@Injectable()
export class ActivateWarrantyUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly warrantyLifecycleService: WarrantyLifecycleService,
    private readonly issueWarrantyCertificateUseCase: IssueWarrantyCertificateUseCase,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(
    warrantyId: string,
    dto: ActivateWarrantyDto,
    context: {
      activatedByUserId?: string;
      actor?: DealerAccessActor;
    } = {},
  ) {
    if (context.actor) {
      const candidate = await this.warrantiesRepository.findById(warrantyId);
      await this.dealerAccessPolicy!.assertCanAccessRecord(
        context.actor,
        candidate?.dealer_id,
      );
    }
    const warranty = await this.warrantiesRepository.withTransaction(
      (repository) =>
        this.warrantyLifecycleService.activateDraftWarranty(repository, {
          activatedByUserId: context.activatedByUserId,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          warrantyId,
        }),
    );

    await this.issueWarrantyCertificateUseCase.execute({
      warrantyId: warranty.id,
    });

    return toWarrantyResponse(warranty);
  }
}
