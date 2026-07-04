import { NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ActivateWarrantyByCodeDto } from '@/modules/warranties/dto/activate-warranty-by-code.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import { warranty_status } from '@prisma/client';

@Injectable()
export class ActivateWarrantyByCodeUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warrantiesRepository: WarrantiesRepository,
  ) {}

  async execute(dto: ActivateWarrantyByCodeDto) {
    const code = dto.warrantyCode.trim().toUpperCase();
    const product =
      await this.warrantiesRepository.findActiveProductByWarrantyCode(code);

    if (!product?.warranty) {
      throw new NotFoundError('Warranty not found');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const durationMonths =
      dto.durationMonths ?? product.warranty.duration_months;

    const updatedWarranty = await this.prismaService.warranty.update({
      where: { id: product.warranty.id },
      data: {
        start_date: startDate,
        end_date: this.addMonths(startDate, durationMonths),
        duration_months: durationMonths,
        status: warranty_status.ACTIVE,
        terms: dto.terms ?? product.warranty.terms,
      },
    });

    await this.prismaService.productOwnership.updateMany({
      where: {
        product_id: product.id,
        is_current_owner: true,
        activated_at: null,
      },
      data: { activated_at: startDate },
    });

    return toWarrantyResponse(updatedWarranty);
  }

  private addMonths(date: Date, months: number) {
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + months);
    return nextDate;
  }
}
