import { loadWorkbookFromBuffer } from '@/common/excel';
import { ExportActivationCodeReportUseCase } from '@/modules/activation-codes/use-cases/export-activation-code-report.use-case';

describe('ExportActivationCodeReportUseCase', () => {
  it('exports the same filtered lifecycle rows used by reporting', async () => {
    const repository = {
      listReportRows: jest.fn().mockResolvedValue([
        {
          id: 'code-1',
          batchCode: 'BATCH-1',
          productSku: 'SKU-1',
          productName: 'Film',
          status: 'ACTIVATED',
          expiresAt: new Date('2026-06-01'),
          createdAt: new Date('2026-01-01'),
          activatedAt: new Date('2026-01-10'),
          provinceCode: '79',
          provinceName: 'TP Hồ Chí Minh',
        },
      ]),
    };

    const buffer = await new ExportActivationCodeReportUseCase(
      repository as never,
    ).execute({ provinceCode: '79' });

    expect(repository.listReportRows).toHaveBeenCalledWith({
      provinceCode: '79',
    });
    const workbook = await loadWorkbookFromBuffer(buffer);
    const rows = workbook.getWorksheet('Mã kích hoạt')?.getSheetValues();
    expect(rows?.[2]).toEqual(
      expect.arrayContaining(['BATCH-1', 'SKU-1', 'Film', 'ACTIVATED']),
    );
  });
});
