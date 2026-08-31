import { BadRequestError, NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { HtmlPdfRendererService } from '@/modules/warranty-certificates/services/html-pdf-renderer.service';
import { ActivationLabelTemplateService } from '@/modules/activation-codes/services/activation-label-template.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreatePrintableActivationLabelsUseCase {
  constructor(
    private readonly repository: ActivationCodeBatchesRepository,
    private readonly crypto: ActivationCodeCryptoService,
    private readonly pdfRenderer: HtmlPdfRendererService,
    private readonly template: ActivationLabelTemplateService = new ActivationLabelTemplateService(),
  ) {}

  async execute(batchId: string, options?: { from?: number; to?: number }) {
    const batch = await this.repository.findWithCodes(batchId);
    if (!batch) throw new NotFoundError('Activation code batch not found');

    const from = options?.from ?? 1;
    const to = options?.to ?? batch.codes.length;
    if (
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
      from < 1 ||
      to < from
    ) {
      throw new BadRequestError(
        'Printable label range is invalid',
        'ACTIVATION_LABEL_RANGE_INVALID',
      );
    }
    const boundedTo = Math.min(batch.codes.length, to);
    const codes = batch.codes.slice(from - 1, boundedTo);
    if (!codes.length) throw new NotFoundError('No activation codes to print');

    const html = this.template.render(
      {
        productName: batch.product_name,
        productSku: batch.product_sku,
        expiresAt: batch.expires_at,
      },
      codes.map((code) => this.crypto.decrypt(code.code_ciphertext)),
    );
    const pdf = await this.pdfRenderer.createPdf(html);
    return { pdf, filename: `${batch.batch_code}-labels.pdf` };
  }
}
