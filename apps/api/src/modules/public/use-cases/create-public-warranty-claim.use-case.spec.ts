import { CreatePublicWarrantyClaimUseCase } from '@/modules/public/use-cases/create-public-warranty-claim.use-case';

describe('CreatePublicWarrantyClaimUseCase', () => {
  it('requires owner verification and returns a public-safe claim response', async () => {
    const createWarrantyClaimWithEvidenceUseCase = {
      execute: jest.fn().mockResolvedValue({
        id: 'claim-id',
        claimCode: 'CLM-0123456789ABCDEFABCD',
        warrantyId: 'warranty-id',
        productId: 'product-id',
        customerId: 'customer-id',
        warrantyCode: 'WM-2026-ABCDEF',
        requesterName: 'Nguyen Van A',
        requesterPhone: '0886337733',
        issueTitle: 'Bubble',
        issueDetail: 'Windshield',
        status: 'SUBMITTED',
        priority: 'NORMAL',
        dueAt: new Date('2026-08-02T00:00:00.000Z'),
        slaBreachedAt: null,
        metadata: null,
        submittedAt: new Date('2026-07-30T00:00:00.000Z'),
        resolvedAt: null,
        createdAt: new Date('2026-07-30T00:00:00.000Z'),
        updatedAt: new Date('2026-07-30T00:00:00.000Z'),
        product: {
          name: 'Fujitek Film',
          brand: 'Fujitek',
          model: 'B55',
        },
        warranty: {
          terms: 'Private warranty terms',
        },
        customer: {
          email: 'customer@example.com',
        },
        serviceCenter: null,
        statusHistory: [],
        attachments: [],
      }),
    };
    const useCase = new CreatePublicWarrantyClaimUseCase(
      createWarrantyClaimWithEvidenceUseCase as never,
    );
    const dto = {
      warrantyCode: 'WM-2026-ABCDEF',
      requesterName: 'Nguyen Van A',
      requesterPhone: '0886337733',
      issueTitle: 'Bubble',
      issueDetail: 'Windshield',
    };

    const file = {
      mimetype: 'image/webp',
      originalname: 'damage.webp',
      size: 5,
    } as Express.Multer.File;
    const result = await useCase.execute(dto, [file]);

    expect(createWarrantyClaimWithEvidenceUseCase.execute).toHaveBeenCalledWith(
      dto,
      [file],
      { requireOwnerMatch: true },
    );
    expect(result).toMatchObject({
      claimCode: 'CLM-0123456789ABCDEFABCD',
      warrantyCode: 'WM-2026-ABCDEF',
      issueTitle: 'Bubble',
      status: 'SUBMITTED',
      priority: 'NORMAL',
      product: {
        name: 'Fujitek Film',
        brand: 'Fujitek',
        model: 'B55',
      },
    });
    expect(result).not.toHaveProperty('requesterName');
    expect(result).not.toHaveProperty('requesterPhone');
    expect(result).not.toHaveProperty('customer');
    expect(result).not.toHaveProperty('warranty');
  });
});
