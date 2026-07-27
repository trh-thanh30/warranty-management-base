import { BadRequestException } from '@nestjs/common';
import { Readable } from 'node:stream';
import { PdfToHtmlConverter } from '@/modules/content-pages/services/pdf-to-html.converter';
import { ParseContentDocumentUseCase } from '@/modules/content-pages/use-cases/parse-content-document.use-case';
import * as mammoth from 'mammoth';

jest.mock('mammoth', () => ({
  convertToHtml: jest.fn(),
}));

describe('ParseContentDocumentUseCase', () => {
  const pdfConverter: jest.Mocked<Pick<PdfToHtmlConverter, 'convert'>> = {
    convert: jest.fn(),
  };
  const createFile = (
    originalname: string,
    mimetype: string,
    buffer: Buffer,
  ): Express.Multer.File => ({
    buffer,
    destination: '',
    encoding: '7bit',
    fieldname: 'file',
    filename: originalname,
    mimetype,
    originalname,
    path: '',
    size: buffer.length,
    stream: Readable.from(buffer),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects requests without a document', async () => {
    const useCase = new ParseContentDocumentUseCase(pdfConverter);

    await expect(useCase.execute(undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects document formats other than PDF and DOCX', async () => {
    const useCase = new ParseContentDocumentUseCase(pdfConverter);
    const file = createFile(
      'policy.txt',
      'text/plain',
      Buffer.from('plain text'),
    );

    await expect(useCase.execute(file)).rejects.toThrow(
      'Chỉ hỗ trợ tài liệu PDF và DOCX.',
    );
  });

  it('converts DOCX content to safe rich-text HTML', async () => {
    jest.mocked(mammoth.convertToHtml).mockResolvedValue({
      messages: [],
      value:
        '<h2 class="word-title">Warranty policy</h2><script>alert(1)</script><p style="color:red"><strong>Covered</strong></p>',
    });
    const useCase = new ParseContentDocumentUseCase(pdfConverter);
    const file = createFile(
      'policy.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      Buffer.from('docx'),
    );

    await expect(useCase.execute(file)).resolves.toEqual({
      content: '<h2>Warranty policy</h2><p><strong>Covered</strong></p>',
    });
  });

  it('converts PDF text to safe rich-text HTML', async () => {
    pdfConverter.convert.mockResolvedValue(
      '<div class="page"><p style="position:absolute">PDF policy</p><iframe src="https://unsafe.example"></iframe></div>',
    );
    const useCase = new ParseContentDocumentUseCase(pdfConverter);
    const file = createFile(
      'policy.pdf',
      'application/pdf',
      Buffer.from('%PDF-1.4'),
    );

    await expect(useCase.execute(file)).resolves.toEqual({
      content: '<p>PDF policy</p>',
    });
  });
});
