import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { fromBuffer } from 'file-type';
import * as mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html';
import { PdfToHtmlConverter } from '@/modules/content-pages/services/pdf-to-html.converter';

@Injectable()
export class ParseContentDocumentUseCase {
  private readonly logger = new Logger(ParseContentDocumentUseCase.name);

  constructor(private readonly pdfToHtmlConverter: PdfToHtmlConverter) {}

  async execute(file?: Express.Multer.File): Promise<{ content: string }> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn tài liệu PDF hoặc DOCX.');
    }

    const extension = file.originalname.split('.').pop()?.toLowerCase();
    const detectedType = await fromBuffer(file.buffer);
    const detectedMime = detectedType?.mime ?? file.mimetype;
    const isPdf = extension === 'pdf' && detectedMime === 'application/pdf';
    const isDocx =
      extension === 'docx' &&
      (detectedMime ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        detectedMime === 'application/zip');

    if (!isPdf && !isDocx) {
      throw new BadRequestException('Chỉ hỗ trợ tài liệu PDF và DOCX.');
    }

    try {
      const content = isPdf
        ? await this.parsePdf(file.buffer)
        : await this.parseDocx(file.buffer);

      if (!content) {
        throw new BadRequestException(
          'Không tìm thấy nội dung văn bản trong tài liệu.',
        );
      }

      return { content };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Unable to parse document: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new BadRequestException(
        'Không thể phân tích tài liệu. File có thể bị hỏng hoặc được đặt mật khẩu.',
      );
    }
  }

  private async parseDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.convertToHtml({ buffer });
    return this.sanitizeDocumentHtml(result.value);
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    const html = await this.pdfToHtmlConverter.convert(buffer);
    return this.sanitizeDocumentHtml(html);
  }

  private sanitizeDocumentHtml(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [
        'p',
        'h1',
        'h2',
        'h3',
        'ul',
        'ol',
        'li',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'strike',
        'blockquote',
        'pre',
        'code',
        'a',
        'br',
        'hr',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      transformTags: {
        b: 'strong',
        i: 'em',
        strike: 's',
      },
    }).trim();
  }
}
