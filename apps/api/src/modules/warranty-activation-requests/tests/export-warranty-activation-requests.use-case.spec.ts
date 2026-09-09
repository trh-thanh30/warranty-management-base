import { loadWorkbookFromBuffer } from '@/common/excel';
import { toWarrantyActivationRequestExcelRow } from '@/modules/warranty-activation-requests/excel/warranty-activation-request-excel.mapper';
import { createWarrantyActivationRequestExportWorkbook } from '@/modules/warranty-activation-requests/excel/warranty-activation-request-workbook.factory';
import { ExportWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/export-warranty-activation-requests.use-case';
import { warranty_activation_request_status } from '@prisma/client';

const request = {
  request_code: 'WARQ-2026-ABC123',
  status: warranty_activation_request_status.REJECTED,
  warranty_code: 'WAR-2026-ABC123',
  customer_name: 'Nguyễn Văn A',
  customer_phone: '0901234567',
  customer_email: 'customer@example.com',
  customer_birthdate: new Date('1990-01-01T00:00:00.000Z'),
  full_address: '1 Nguyễn Trãi, Hà Nội',
  product_name: 'Bộ pin chính hãng',
  serial_number: 'SN-001',
  brand: 'Toyota',
  model: 'Battery Plus',
  manufacture_year: 2026,
  installed_at: new Date('2026-07-21T08:30:00.000Z'),
  note: 'Khách hàng gửi từ website',
  admin_note: 'Đã đối chiếu',
  rejection_reason: 'Thông tin không khớp',
  reviewed_at: new Date('2026-07-22T10:00:00.000Z'),
  activated_warranty_id: null,
  created_at: new Date('2026-07-21T10:00:00.000Z'),
  updated_at: new Date('2026-07-22T10:00:00.000Z'),
  reviewed_by: {
    full_name: 'Admin vận hành',
    username: 'admin',
    email: 'admin@example.com',
  },
  items: [
    {
      position_label: 'Kính lái',
      product_name: 'Film SP50',
      product_code: 'SP50-001',
      serial_number: 'SN-SP50',
      warranty_code: 'WM-SP50',
    },
    {
      position_label: 'Kính lưng',
      product_name: 'Film B55',
      product_code: 'B55-001',
      serial_number: null,
      warranty_code: 'WM-B55',
    },
  ],
};

describe('ExportWarrantyActivationRequestsUseCase', () => {
  it('maps review information for reconciliation', () => {
    const row = toWarrantyActivationRequestExcelRow(request as never);

    expect(row).toEqual(
      expect.objectContaining({
        requestCode: 'WARQ-2026-ABC123',
        status: 'Đã từ chối',
        reviewedBy: 'Admin vận hành',
        rejectionReason: 'Thông tin không khớp',
        itemCount: 2,
        productsByPosition: 'Kính lái: WM-SP50; Kính lưng: WM-B55',
        installedAt: new Date('2026-07-21T08:30:00.000Z'),
      }),
    );
  });

  it('exports installation date as a native Excel date-time cell', async () => {
    const buffer = await createWarrantyActivationRequestExportWorkbook([
      toWarrantyActivationRequestExcelRow(request as never),
    ]);
    const workbook = await loadWorkbookFromBuffer(buffer);
    const worksheet = workbook.getWorksheet('Yêu cầu kích hoạt');
    const headers = worksheet?.getRow(1).values as unknown[];
    const installedAtColumnIndex = headers.indexOf('Ngày thi công');
    const installedAtColumn = worksheet?.getColumn(installedAtColumnIndex);

    expect(installedAtColumn?.numFmt).toBe('dd/mm/yyyy hh:mm');
    expect(worksheet?.getCell(2, installedAtColumnIndex).value).toEqual(
      new Date('2026-07-21T08:30:00.000Z'),
    );
  });

  it('keeps the installation date cell empty when it is not set', () => {
    const row = toWarrantyActivationRequestExcelRow({
      ...request,
      installed_at: null,
    } as never);

    expect(row.installedAt).toBeNull();
  });

  it('exports all requests matching the supplied filters', async () => {
    const repository = {
      listForExport: jest.fn().mockResolvedValue([request]),
    };
    const useCase = new ExportWarrantyActivationRequestsUseCase(
      repository as never,
    );
    const filters = { status: warranty_activation_request_status.REJECTED };

    const buffer = await useCase.execute(filters);

    expect(repository.listForExport).toHaveBeenCalledWith(filters);
    expect(buffer.subarray(0, 2).toString()).toBe('PK');
  });
});
