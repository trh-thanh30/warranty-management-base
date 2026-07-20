import { BadRequestError, NotFoundError } from '@/common/response';
import { CreateWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim.use-case';
import { Prisma } from '@prisma/client';

describe('CreateWarrantyClaimUseCase', () => {
  const warrantyClaimsRepository = {
    findWarrantyProductByCode: jest.fn(),
    create: jest.fn(),
  };
  const generateWarrantyClaimCodeUseCase = {
    execute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a claim from a valid warranty code and current owner', async () => {
    warrantyClaimsRepository.findWarrantyProductByCode.mockResolvedValue({
      id: 'product-id',
      warranty_code: 'WM-2026-ABCDEF',
      warranty: {
        id: 'warranty-id',
        status: 'ACTIVE',
      },
      ownerships: [
        {
          customer: {
            id: 'customer-id',
          },
        },
      ],
    });
    generateWarrantyClaimCodeUseCase.execute.mockResolvedValue(
      'CLM-2026-ABC123',
    );
    warrantyClaimsRepository.create.mockResolvedValue({
      id: 'claim-id',
      claim_code: 'CLM-2026-ABC123',
      warranty_id: 'warranty-id',
      product_id: 'product-id',
      customer_id: 'customer-id',
      warranty_code: 'WM-2026-ABCDEF',
      requester_name: 'Nguyen Van A',
      requester_phone: '0901234567',
      issue_title: 'May khong hoat dong',
      issue_detail: 'Mo ta loi',
      status: 'SUBMITTED',
      submitted_at: new Date('2026-07-02T00:00:00.000Z'),
      resolved_at: null,
      created_at: new Date('2026-07-02T00:00:00.000Z'),
      updated_at: new Date('2026-07-02T00:00:00.000Z'),
      product: undefined,
      warranty: undefined,
      customer: undefined,
    });
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
    );

    const result = await useCase.execute({
      warrantyCode: 'wm-2026-abcdef',
      requesterName: ' Nguyen Van A ',
      requesterPhone: ' 0901234567 ',
      issueTitle: 'May khong hoat dong',
      issueDetail: 'Mo ta loi',
    });

    expect(
      warrantyClaimsRepository.findWarrantyProductByCode,
    ).toHaveBeenCalledWith('WM-2026-ABCDEF');
    expect(warrantyClaimsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        claim_code: 'CLM-2026-ABC123',
        warranty_code: 'WM-2026-ABCDEF',
        warranty: { connect: { id: 'warranty-id' } },
        product: { connect: { id: 'product-id' } },
        customer: { connect: { id: 'customer-id' } },
        requester_name: 'Nguyen Van A',
        requester_phone: '0901234567',
      }),
    );
    expect(result.claimCode).toBe('CLM-2026-ABC123');
  });

  it('retries with a new claim code when claim code creation collides', async () => {
    warrantyClaimsRepository.findWarrantyProductByCode.mockResolvedValue({
      id: 'product-id',
      warranty_code: 'WM-2026-ABCDEF',
      warranty: {
        id: 'warranty-id',
        status: 'ACTIVE',
      },
      ownerships: [],
    });
    generateWarrantyClaimCodeUseCase.execute
      .mockResolvedValueOnce('CLM000001')
      .mockResolvedValueOnce('CLM000002');
    warrantyClaimsRepository.create
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
          meta: { target: ['claim_code'] },
        }),
      )
      .mockResolvedValueOnce({
        id: 'claim-id',
        claim_code: 'CLM000002',
        warranty_id: 'warranty-id',
        product_id: 'product-id',
        customer_id: null,
        warranty_code: 'WM-2026-ABCDEF',
        requester_name: 'Nguyen Van A',
        requester_phone: '0901234567',
        issue_title: 'May khong hoat dong',
        issue_detail: undefined,
        status: 'SUBMITTED',
        submitted_at: new Date('2026-07-02T00:00:00.000Z'),
        resolved_at: null,
        created_at: new Date('2026-07-02T00:00:00.000Z'),
        updated_at: new Date('2026-07-02T00:00:00.000Z'),
        product: undefined,
        warranty: undefined,
        customer: undefined,
      });
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
    );

    const result = await useCase.execute({
      warrantyCode: 'WM-2026-ABCDEF',
      requesterName: 'Nguyen Van A',
      requesterPhone: '0901234567',
      issueTitle: 'May khong hoat dong',
    });

    expect(generateWarrantyClaimCodeUseCase.execute).toHaveBeenCalledTimes(2);
    expect(warrantyClaimsRepository.create).toHaveBeenCalledTimes(2);
    expect(result.claimCode).toBe('CLM000002');
  });

  it('throws not found when the warranty code is absent', async () => {
    warrantyClaimsRepository.findWarrantyProductByCode.mockResolvedValue(null);
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
    );

    await expect(
      useCase.execute({
        warrantyCode: 'WM-2026-MISSING',
        requesterName: 'Nguyen Van A',
        requesterPhone: '0901234567',
        issueTitle: 'May khong hoat dong',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects voided warranties', async () => {
    warrantyClaimsRepository.findWarrantyProductByCode.mockResolvedValue({
      id: 'product-id',
      warranty_code: 'WM-2026-VOIDED',
      warranty: {
        id: 'warranty-id',
        status: 'VOIDED',
      },
      ownerships: [],
    });
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
    );

    await expect(
      useCase.execute({
        warrantyCode: 'WM-2026-VOIDED',
        requesterName: 'Nguyen Van A',
        requesterPhone: '0901234567',
        issueTitle: 'May khong hoat dong',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
