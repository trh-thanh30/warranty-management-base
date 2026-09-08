import { BadRequestError, NotFoundError } from '@/common/response';
import { WarrantyClaimSlaService } from '@/modules/warranty-claims/service/warranty-claim-sla.service';
import { CreateWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim.use-case';
import { Prisma } from '@prisma/client';

describe('CreateWarrantyClaimUseCase', () => {
  const warrantyClaimsRepository = {
    findWarrantyByCode: jest.fn(),
    findOpenByWarrantyId: jest.fn(),
    create: jest.fn(),
  };
  const generateWarrantyClaimCodeUseCase = {
    execute: jest.fn(),
  };
  const warrantyClaimSlaService = new WarrantyClaimSlaService();
  const buildWarranty = (overrides: Record<string, unknown> = {}) => ({
    id: 'warranty-id',
    warranty_code: 'WM-2026-ABCDEF',
    status: 'ACTIVE',
    start_date: new Date('2026-01-01T00:00:00.000Z'),
    end_date: new Date('2028-01-01T00:00:00.000Z'),
    ownerships: [],
    product: { id: 'product-id', deleted_at: null },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    warrantyClaimsRepository.findOpenByWarrantyId.mockResolvedValue(null);
  });

  it('creates a claim from a valid warranty code and current owner', async () => {
    warrantyClaimsRepository.findWarrantyByCode.mockResolvedValue(
      buildWarranty({
        ownerships: [
          {
            customer: {
              id: 'customer-id',
            },
          },
        ],
      }),
    );
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
      warrantyClaimSlaService,
    );

    const result = await useCase.execute({
      warrantyCode: 'wm-2026-abcdef',
      requesterName: ' Nguyen Van A ',
      requesterPhone: ' 0901234567 ',
      issueTitle: 'May khong hoat dong',
      issueDetail: 'Mo ta loi',
    });

    expect(warrantyClaimsRepository.findWarrantyByCode).toHaveBeenCalledWith(
      'WM-2026-ABCDEF',
    );
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
    warrantyClaimsRepository.findWarrantyByCode.mockResolvedValue(
      buildWarranty(),
    );
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
      warrantyClaimSlaService,
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
    warrantyClaimsRepository.findWarrantyByCode.mockResolvedValue(null);
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
      warrantyClaimSlaService,
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

  it('rejects a second claim while the warranty already has an open claim', async () => {
    warrantyClaimsRepository.findWarrantyByCode.mockResolvedValue(
      buildWarranty(),
    );
    warrantyClaimsRepository.findOpenByWarrantyId.mockResolvedValue({
      claim_code: 'CLM-2026-OPEN01',
      status: 'REVIEWING',
    });
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
      warrantyClaimSlaService,
    );

    await expect(
      useCase.execute({
        warrantyCode: 'WM-2026-ABCDEF',
        requesterName: 'Nguyen Van A',
        requesterPhone: '0901234567',
        issueTitle: 'Bubble',
      }),
    ).rejects.toMatchObject({
      code: 'WARRANTY_CLAIM_ALREADY_OPEN',
      details: expect.objectContaining({
        claimCode: 'CLM-2026-OPEN01',
        currentStatus: 'REVIEWING',
      }),
    });
    expect(warrantyClaimsRepository.create).not.toHaveBeenCalled();
  });

  it('rejects a public claim when requester phone does not match the current owner', async () => {
    warrantyClaimsRepository.findWarrantyByCode.mockResolvedValue(
      buildWarranty({
        ownerships: [
          {
            customer: {
              id: 'customer-id',
              phone: '0886 33 77 33',
            },
          },
        ],
      }),
    );
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
      warrantyClaimSlaService,
    );

    await expect(
      useCase.execute(
        {
          warrantyCode: 'WM-2026-ABCDEF',
          requesterName: 'Nguyen Van A',
          requesterPhone: '0901234567',
          issueTitle: 'Bubble',
        },
        { requireOwnerMatch: true },
      ),
    ).rejects.toMatchObject({
      code: 'WARRANTY_CLAIM_OWNER_MISMATCH',
    });
    expect(warrantyClaimsRepository.create).not.toHaveBeenCalled();
  });

  it('accepts a formatted public phone matching the normalized owner phone', async () => {
    warrantyClaimsRepository.findWarrantyByCode.mockResolvedValue(
      buildWarranty({
        ownerships: [
          {
            customer: {
              id: 'customer-id',
              phone: '0886337733',
            },
          },
        ],
      }),
    );
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
      requester_phone: '0886 33 77 33',
      issue_title: 'Bubble',
      issue_detail: null,
      status: 'SUBMITTED',
      submitted_at: new Date('2026-07-30T00:00:00.000Z'),
      resolved_at: null,
      created_at: new Date('2026-07-30T00:00:00.000Z'),
      updated_at: new Date('2026-07-30T00:00:00.000Z'),
      product: undefined,
      warranty: undefined,
      customer: undefined,
    });
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
      warrantyClaimSlaService,
    );

    await expect(
      useCase.execute(
        {
          warrantyCode: 'WM-2026-ABCDEF',
          requesterName: 'Nguyen Van A',
          requesterPhone: '0886 33 77 33',
          issueTitle: 'Bubble',
        },
        { requireOwnerMatch: true },
      ),
    ).resolves.toMatchObject({
      claimCode: 'CLM-2026-ABC123',
    });
  });

  it('rejects voided warranties', async () => {
    warrantyClaimsRepository.findWarrantyByCode.mockResolvedValue(
      buildWarranty({
        warranty_code: 'WM-2026-VOIDED',
        status: 'VOIDED',
      }),
    );
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
      warrantyClaimSlaService,
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

  it.each([
    ['DRAFT', undefined],
    ['EXPIRED', undefined],
    ['ACTIVE', new Date('2026-01-01T00:00:00.000Z')],
  ])(
    'rejects a %s warranty that is not currently eligible',
    async (status, endDate) => {
      warrantyClaimsRepository.findWarrantyByCode.mockResolvedValue(
        buildWarranty({
          warranty_code: 'WM-2026-INELIGIBLE',
          status,
          end_date: endDate,
        }),
      );
      const useCase = new CreateWarrantyClaimUseCase(
        warrantyClaimsRepository as never,
        generateWarrantyClaimCodeUseCase as never,
        warrantyClaimSlaService,
      );

      await expect(
        useCase.execute({
          warrantyCode: 'WM-2026-INELIGIBLE',
          requesterName: 'Nguyen Van A',
          requesterPhone: '0901234567',
          issueTitle: 'May khong hoat dong',
        }),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(warrantyClaimsRepository.create).not.toHaveBeenCalled();
    },
  );

  it('rejects an active warranty before its start date', async () => {
    warrantyClaimsRepository.findWarrantyByCode.mockResolvedValue(
      buildWarranty({
        warranty_code: 'WM-2026-FUTURE',
        start_date: new Date('2099-01-01T00:00:00.000Z'),
      }),
    );
    const useCase = new CreateWarrantyClaimUseCase(
      warrantyClaimsRepository as never,
      generateWarrantyClaimCodeUseCase as never,
      warrantyClaimSlaService,
    );

    await expect(
      useCase.execute({
        warrantyCode: 'WM-2026-FUTURE',
        requesterName: 'Nguyen Van A',
        requesterPhone: '0901234567',
        issueTitle: 'May khong hoat dong',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(warrantyClaimsRepository.create).not.toHaveBeenCalled();
  });
});
