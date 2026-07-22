import { PrismaService } from '@/database/prisma/prisma.service';
import { VoidWarrantyDto } from '@/modules/warranties/dto/void-warranty.dto';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VoidWarrantyUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warrantyLifecycleService: WarrantyLifecycleService,
  ) {}

  async execute(
    warrantyId: string,
    dto: VoidWarrantyDto,
    context: { voidedByUserId: string },
  ) {
    const warranty = await this.prismaService.$transaction((tx) =>
      this.warrantyLifecycleService.voidWarranty(tx, {
        reason: dto.reason,
        voidedByUserId: context.voidedByUserId,
        warrantyId,
      }),
    );

    return toWarrantyResponse(warranty);
  }
}
