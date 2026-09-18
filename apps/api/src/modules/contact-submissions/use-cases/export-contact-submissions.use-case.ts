import type { ExportContactSubmissionsQuery } from '@repo/shared';
import { Injectable } from '@nestjs/common';
import { createContactSubmissionsExportWorkbook } from '../excel/contact-submissions-workbook.factory';
import { ContactSubmissionsRepository } from '../repository/contact-submissions.repository';

@Injectable()
export class ExportContactSubmissionsUseCase {
  constructor(private readonly repository: ContactSubmissionsRepository) {}

  async execute(query: ExportContactSubmissionsQuery) {
    const submissions = await this.repository.listForExport(query);
    return createContactSubmissionsExportWorkbook(submissions);
  }
}
