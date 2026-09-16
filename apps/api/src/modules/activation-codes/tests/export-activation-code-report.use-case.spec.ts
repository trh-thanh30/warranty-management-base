import { loadWorkbookFromBuffer } from '@/common/excel';
import { createActivationCodeReportWorkbook } from '@/modules/activation-codes/excel/activation-code-report-workbook.factory';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ExportActivationCodeReportUseCase } from '@/modules/activation-codes/use-cases/export-activation-code-report.use-case';
import { activation_code_status } from '@prisma/client';

describe('ExportActivationCodeReportUseCase', () => {
  it('reads the batch name for each exported activation code', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'code-1',
        status: activation_code_status.AVAILABLE,
        created_at: new Date('2026-01-01'),
        expires_at: new Date('2027-01-01'),
        activated_at: null,
        batch: {
          batch_code: 'BATCH-1',
          batch_name: 'Lô tháng 6',
          product_sku: null,
          product_name: null,
        },
        request: null,
      },
    ]);
    const repository = new ActivationCodeBatchesRepository(
      { activationCode: { findMany } } as never,
      {} as never,
    );

    const rows = await repository.listReportRows({});

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          batch: {
            select: {
              batch_code: true,
              batch_name: true,
              product_sku: true,
              product_name: true,
            },
          },
        }),
      }),
    );
    expect(rows[0]?.batchName).toBe('Lô tháng 6');
  });

  it('exports the same filtered lifecycle rows used by reporting', async () => {
    const repository = {
      listReportRows: jest.fn().mockResolvedValue([
        {
          id: 'code-1',
          batchCode: 'BATCH-1',
          batchName: 'Lô tháng 6',
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
    const sheet = workbook.getWorksheet('Mã kích hoạt');
    expect(sheet?.getRow(1).values).toEqual([
      undefined,
      'Lô mã',
      'Tên lô mã',
      'SKU sản phẩm',
      'Tên sản phẩm',
      'Trạng thái',
      'Ngày tạo',
      'Ngày hết hạn',
      'Ngày kích hoạt',
      'Tỉnh/thành',
      'Mã đại lý',
      'Đại lý',
    ]);
    expect(sheet?.getColumn(1).width).toBe(28);
    expect(sheet?.getRow(2).getCell(1).value).toBe('BATCH-1');
    expect(sheet?.getRow(2).getCell(2).value).toBe('Lô tháng 6');
    expect(sheet?.getRow(2).getCell(5).value).toBe('Đã kích hoạt');
    expect(sheet?.getRow(2).getCell(9).value).toBe('TP Hồ Chí Minh');
  });

  it('translates every activation status in the exported workbook', async () => {
    const labels: Array<[activation_code_status, string]> = [
      [activation_code_status.AVAILABLE, 'Có thể kích hoạt'],
      [activation_code_status.PENDING_APPROVAL, 'Chờ duyệt'],
      [activation_code_status.ACTIVATED, 'Đã kích hoạt'],
      [activation_code_status.EXPIRED, 'Đã hết hạn'],
      [activation_code_status.REVOKED, 'Đã thu hồi'],
      [activation_code_status.REPLACED, 'Đã thay thế'],
    ];
    const buffer = await createActivationCodeReportWorkbook(
      labels.map(([status], index) => ({
        id: String(index),
        batchCode: 'BATCH-1',
        batchName: 'Lô tháng 6',
        productSku: null,
        productName: null,
        status,
        createdAt: new Date('2026-01-01'),
        expiresAt: new Date('2027-01-01'),
        activatedAt: null,
        provinceCode: null,
        provinceName: null,
        dealerCode: null,
        dealerName: null,
      })),
    );
    const sheet = (await loadWorkbookFromBuffer(buffer)).getWorksheet(
      'Mã kích hoạt',
    );
    labels.forEach(([, label], index) => {
      expect(sheet?.getRow(index + 2).getCell(5).value).toBe(label);
    });
  });
});
