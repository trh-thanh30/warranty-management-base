import { PrismaService } from '@/database/prisma/prisma.service';
import { ActivateWarrantyDto } from '@/modules/warranties/dto/activate-warranty.dto';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivateWarrantyUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warrantyLifecycleService: WarrantyLifecycleService,
  ) {}

  async execute(
    warrantyId: string,
    dto: ActivateWarrantyDto,
    context: { activatedByUserId?: string } = {},
  ) {
    const warranty = await this.prismaService.$transaction((tx) =>
      this.warrantyLifecycleService.activateDraftWarranty(tx, {
        activatedByUserId: context.activatedByUserId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        warrantyId,
      }),
    );

    return toWarrantyResponse(warranty);
  }
}
