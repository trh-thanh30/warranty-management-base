import { HtmlPdfRendererService } from '@/modules/warranty-certificates/services/html-pdf-renderer.service';
import { WarrantyCertificateHtmlTemplateService } from '@/modules/warranty-certificates/services/warranty-certificate-html-template.service';
import type { WarrantyCertificatePdfInput } from '@/modules/warranty-certificates/warranty-certificate.types';
import { buildWarrantyCertificateViewModel } from '@/modules/warranty-certificates/utils/warranty-certificate-view-model.util';
import { Injectable } from '@nestjs/common';

export type { WarrantyCertificatePdfInput } from '@/modules/warranty-certificates/warranty-certificate.types';

@Injectable()
export class WarrantyCertificatePdfService {
  constructor(
    private readonly htmlTemplate: WarrantyCertificateHtmlTemplateService,
    private readonly htmlPdfRenderer: HtmlPdfRendererService,
  ) {}

  async createPdfBuffer(input: WarrantyCertificatePdfInput) {
    const viewModel = buildWarrantyCertificateViewModel(input);
    const html = this.htmlTemplate.render(viewModel);

    return this.htmlPdfRenderer.createPdf(html);
  }
}
