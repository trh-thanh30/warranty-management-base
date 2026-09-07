import { BadRequestError, NotFoundError } from '@/common/response';
import { TransferWarrantyOwnerDto } from '@/modules/warranties/dto/transfer-warranty-owner.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyListItemResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import { warranty_status } from '@prisma/client';

@Injectable()
export class TransferWarrantyOwnerUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(warrantyId: string, dto: TransferWarrantyOwnerDto) {
    const warranty = await this.warrantiesRepository.findById(warrantyId);
    if (!warranty) throw new NotFoundError('Warranty not found');
    if (
      warranty.status === warranty_status.EXPIRED ||
      warranty.status === warranty_status.VOIDED
    ) {
      throw new BadRequestError(
        'Expired or voided warranties cannot change owner',
        'WARRANTY_OWNER_TRANSFER_NOT_ALLOWED',
      );
    }

    const transferred = await this.warrantiesRepository.withTransaction((tx) =>
      tx.transferWarrantyOwnership({
        customerId: dto.customerId,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        warrantyId,
      }),
    );

    return toWarrantyListItemResponse(transferred);
  }
}
