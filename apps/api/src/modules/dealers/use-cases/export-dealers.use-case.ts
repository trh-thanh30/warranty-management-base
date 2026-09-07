import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { toDealerExcelRow } from '@/modules/dealers/excel/dealer-excel.mapper';
import { createDealerExportWorkbook } from '@/modules/dealers/excel/dealer-workbook.factory';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { Injectable } from '@nestjs/common';
import type { DealerAccessActor } from '@/modules/dealers/service/dealer-access.policy';
import { user_role } from '@prisma/client';

@Injectable()
export class ExportDealersUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(dto: ListDealersDto, actor: DealerAccessActor) {
    const assignedUserId =
      actor.role === user_role.ADMIN ? undefined : actor.id;
    const dealers = await this.dealersRepository.listForExport(
      dto,
      assignedUserId,
    );
    return createDealerExportWorkbook(dealers.map(toDealerExcelRow));
  }
}
