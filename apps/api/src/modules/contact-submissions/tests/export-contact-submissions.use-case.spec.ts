import { loadWorkbookFromBuffer } from '@/common/excel';
import { createContactSubmissionsExportWorkbook } from '../excel/contact-submissions-workbook.factory';
import { ExportContactSubmissionsUseCase } from '../use-cases/export-contact-submissions.use-case';

const submission = {
  id: 'contact-id',
  full_name: 'Nguyễn Văn A',
  phone: '0344247918',
  consultation_topic: 'WARRANTY',
  province_code: '79',
  province_name: 'Thành phố Hồ Chí Minh',
  content: 'Cần tư vấn về bảo hành sản phẩm',
  source_path: '/vi/lien-he',
  status: 'ARCHIVED' as const,
  created_at: new Date('2026-09-17T16:14:00.000Z'),
  updated_at: new Date('2026-09-17T17:14:00.000Z'),
};

describe('ExportContactSubmissionsUseCase', () => {
  it('passes filters to the unpaginated repository export', async () => {
    const repository = {
      listForExport: jest.fn().mockResolvedValue([submission]),
    };
    const useCase = new ExportContactSubmissionsUseCase(repository as never);

    const buffer = await useCase.execute({
      search: 'Nguyễn',
      status: 'ARCHIVED',
    });

    expect(repository.listForExport).toHaveBeenCalledWith({
      search: 'Nguyễn',
      status: 'ARCHIVED',
    });
    expect(buffer.subarray(0, 2).toString()).toBe('PK');
  });

  it('exports Vietnamese labels, phone as text and Vietnam-local dates', async () => {
    const buffer = await createContactSubmissionsExportWorkbook([submission]);
    const workbook = await loadWorkbookFromBuffer(buffer);
    const sheet = workbook.getWorksheet('Lời nhắn liên hệ');
    const headers = sheet?.getRow(1).values as unknown[];

    expect(headers).toContain('Hỗ trợ tư vấn');
    expect(headers).not.toContain('Nguồn');
    expect(sheet?.getColumn(2).numFmt).toBe('@');
    expect(sheet?.getCell('B2').value).toBe('0344247918');
    expect(sheet?.getCell('C2').value).toBe('Bảo hành');
    expect(sheet?.getCell('F2').value).toBe('Đã lưu trữ');
    expect(sheet?.getCell('G2').value).toContain('23:14');
  });
});
