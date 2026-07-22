import { toWarrantyClaimExcelRow } from '@/modules/warranty-claims/excel/warranty-claim-excel.mapper';
import { ExportWarrantyClaimsUseCase } from '@/modules/warranty-claims/use-cases/export-warranty-claims.use-case';
import { warranty_claim_priority, warranty_claim_status } from '@prisma/client';

const claim = {
  claim_code: 'CLM-2026-ABC123',
  warranty_code: 'WAR-2026-ABC123',
  requester_name: 'Nguyễn Văn A',
  requester_phone: '0901234567',
  issue_title: 'Pin không hoạt động',
  issue_detail: 'Không thể khởi động sản phẩm',
  status: warranty_claim_status.REVIEWING,
  priority: warranty_claim_priority.HIGH,
  due_at: new Date('2026-07-20T10:00:00.000Z'),
  sla_breached_at: null,
  submitted_at: new Date('2026-07-18T10:00:00.000Z'),
  resolved_at: null,
  created_at: new Date('2026-07-18T10:00:00.000Z'),
  product: {
    product_code: 'PRD-001',
    name: 'Bộ pin chính hãng',
    serial_number: 'SN-001',
  },
  customer: { full_name: 'Nguyễn Văn A' },
  service_center: {
    name: 'Trạm Hà Nội',
    province: 'Hà Nội',
    phone: '0909999999',
  },
};

describe('ExportWarrantyClaimsUseCase', () => {
  it('maps claim status, SLA, and service center for operations', () => {
    const row = toWarrantyClaimExcelRow(
      claim as never,
      new Date('2026-07-22T10:00:00.000Z'),
    );

    expect(row).toEqual(
      expect.objectContaining({
        claimCode: 'CLM-2026-ABC123',
        status: 'Đang xem xét',
        priority: 'Cao',
        slaStatus: 'Quá hạn',
        serviceCenterName: 'Trạm Hà Nội',
      }),
    );
  });

  it('exports all rows matching the supplied filters', async () => {
    const repository = {
      listForExport: jest.fn().mockResolvedValue([claim]),
    };
    const useCase = new ExportWarrantyClaimsUseCase(repository as never);
    const filters = {
      isOverdue: 'true',
      status: warranty_claim_status.REVIEWING,
    };

    const buffer = await useCase.execute(filters);

    expect(repository.listForExport).toHaveBeenCalledWith(filters);
    expect(buffer.subarray(0, 2).toString()).toBe('PK');
  });
});
