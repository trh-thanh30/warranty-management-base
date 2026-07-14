import { BadRequestError, NotFoundError } from '@/common/response';
import { UpdateWarrantyClaimPriorityDto } from '@/modules/warranty-claims/dto/update-warranty-claim-priority.dto';
import { WarrantyClaimSlaService } from '@/modules/warranty-claims/service/warranty-claim-sla.service';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateWarrantyClaimPriorityUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
    private readonly warrantyClaimSlaService: WarrantyClaimSlaService,
  ) {}

  async execute(id: string, dto: UpdateWarrantyClaimPriorityDto) {
    const claim = await this.warrantyClaimsRepository.findById(id);

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    if (!dto.priority && !dto.dueAt) {
      throw new BadRequestError('Priority or dueAt is required');
    }

    const priority = dto.priority ?? claim.priority;
    const dueAt = dto.dueAt
      ? new Date(dto.dueAt)
      : dto.priority
        ? this.warrantyClaimSlaService.calculateDueAt(priority, new Date())
        : claim.due_at;
    const slaBreachedAt = this.warrantyClaimSlaService.calculateSlaBreachedAt({
      status: claim.status,
      due_at: dueAt,
      sla_breached_at: null,
    });
    const updatedClaim = await this.warrantyClaimsRepository.updatePriority({
      id,
      priority,
      dueAt,
      slaBreachedAt,
    });

    return toWarrantyClaimResponse(updatedClaim);
  }
}
