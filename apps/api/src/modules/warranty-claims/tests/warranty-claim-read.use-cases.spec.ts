import { NotFoundError } from '@/common/response';
import { GetWarrantyClaimDetailUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-detail.use-case';
import { ListWarrantyClaimsUseCase } from '@/modules/warranty-claims/use-cases/list-warranty-claims.use-case';
import { LookupWarrantyClaimByCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claim-by-code.use-case';
import { LookupWarrantyClaimsByWarrantyCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claims-by-warranty-code.use-case';
import { warranty_claim_status } from '@prisma/client';

const claim = {
  id: 'claim-id',
  claim_code: 'CLM-2026-ABC123',
  warranty_id: 'warranty-id',
  product_id: 'product-id',
  customer_id: 'customer-id',
  warranty_code: 'WM-2026-ABCDEF',
  requester_name: 'Nguyen Van A',
  requester_phone: '0901234567',
  issue_title: 'May khong hoat dong',
  issue_detail: null,
  status: 'SUBMITTED',
  submitted_at: new Date('2026-07-02T00:00:00.000Z'),
  resolved_at: null,
  created_at: new Date('2026-07-02T00:00:00.000Z'),
  updated_at: new Date('2026-07-02T00:00:00.000Z'),
};

describe('Warranty claim read use cases', () => {
  const warrantyClaimsRepository = {
    list: jest.fn(),
    findById: jest.fn(),
    findByClaimCode: jest.fn(),
    findByWarrantyCode: jest.fn(),
    listClaimAssets: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists claims with filters', async () => {
    warrantyClaimsRepository.list.mockResolvedValue([claim]);
    const useCase = new ListWarrantyClaimsUseCase(
      warrantyClaimsRepository as never,
    );

    const result = await useCase.execute({
      status: warranty_claim_status.SUBMITTED,
    });

    expect(warrantyClaimsRepository.list).toHaveBeenCalledWith({
      status: 'SUBMITTED',
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.claimCode).toBe('CLM-2026-ABC123');
  });

  it('returns claim detail by id', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue(claim);
    warrantyClaimsRepository.listClaimAssets.mockResolvedValue([]);
    const useCase = new GetWarrantyClaimDetailUseCase(
      warrantyClaimsRepository as never,
    );

    const result = await useCase.execute('claim-id');

    expect(result.id).toBe('claim-id');
  });

  it('throws not found when claim detail is absent', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue(null);
    const useCase = new GetWarrantyClaimDetailUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('looks up a claim by claim code', async () => {
    warrantyClaimsRepository.findByClaimCode.mockResolvedValue(claim);
    const useCase = new LookupWarrantyClaimByCodeUseCase(
      warrantyClaimsRepository as never,
    );

    const result = await useCase.execute('clm-2026-abc123');

    expect(warrantyClaimsRepository.findByClaimCode).toHaveBeenCalledWith(
      'CLM-2026-ABC123',
    );
    expect(result.claimCode).toBe('CLM-2026-ABC123');
  });

  it('looks up claims by warranty code', async () => {
    warrantyClaimsRepository.findByWarrantyCode.mockResolvedValue([claim]);
    const useCase = new LookupWarrantyClaimsByWarrantyCodeUseCase(
      warrantyClaimsRepository as never,
    );

    const result = await useCase.execute('wm-2026-abcdef');

    expect(warrantyClaimsRepository.findByWarrantyCode).toHaveBeenCalledWith(
      'WM-2026-ABCDEF',
    );
    expect(result[0]?.warrantyCode).toBe('WM-2026-ABCDEF');
  });
});
