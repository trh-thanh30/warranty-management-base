import { ListWarrantyClaimsDto } from '@/modules/warranty-claims/dto/list-warranty-claims.dto';
import { toWarrantyClaimExcelRow } from '@/modules/warranty-claims/excel/warranty-claim-excel.mapper';
import { createWarrantyClaimExportWorkbook } from '@/modules/warranty-claims/excel/warranty-claim-workbook.factory';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportWarrantyClaimsUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(filters: ListWarrantyClaimsDto) {
    const claims = await this.warrantyClaimsRepository.listForExport(filters);
    return createWarrantyClaimExportWorkbook(
      claims.map((claim) => toWarrantyClaimExcelRow(claim)),
    );
  }
}
