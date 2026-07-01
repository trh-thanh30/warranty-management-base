import { NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ActivateWarrantyDto } from '@/modules/warranties/dto/activate-warranty.dto';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import { warranty_status } from '@prisma/client';

@Injectable()
export class ActivateWarrantyUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(productId: string, dto: ActivateWarrantyDto) {
    const warranty = await this.prismaService.warranty.findUnique({
      where: { product_id: productId },
    });

    if (!warranty) {
      throw new NotFoundError('Warranty not found');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const durationMonths = dto.durationMonths ?? warranty.duration_months;
    const updatedWarranty = await this.prismaService.warranty.update({
      where: { id: warranty.id },
      data: {
        start_date: startDate,
        end_date: this.addMonths(startDate, durationMonths),
        duration_months: durationMonths,
        status: warranty_status.ACTIVE,
        terms: dto.terms ?? warranty.terms,
      },
    });

    await this.prismaService.productOwnership.updateMany({
      where: {
        product_id: productId,
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
