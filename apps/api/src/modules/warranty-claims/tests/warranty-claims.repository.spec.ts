import { PrismaService } from '@/database/prisma/prisma.service';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { asset_access_type, asset_type } from '@prisma/client';

describe('WarrantyClaimsRepository', () => {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(0);
  const createClaim = jest.fn().mockResolvedValue({ id: 'claim-id' });
  const createAssets = jest.fn().mockResolvedValue({ count: 1 });
  const createAssetLinks = jest.fn().mockResolvedValue({ count: 1 });
  const findUniqueOrThrow = jest.fn().mockResolvedValue({ id: 'claim-id' });
  const prismaService = {
    $transaction: jest.fn((callback: (transaction: unknown) => unknown) =>
      callback({
        asset: { createMany: createAssets },
        assetLink: { createMany: createAssetLinks },
        warrantyClaim: {
          count,
          create: createClaim,
          findMany,
          findUniqueOrThrow,
        },
      }),
    ),
  } as unknown as PrismaService;
  const repository = new WarrantyClaimsRepository(prismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters unassigned claims by a null service center', async () => {
    await repository.list({ assignmentStatus: 'UNASSIGNED' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ service_center_id: null }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({ service_center_id: null }),
    });
  });

  it('filters assigned claims by a non-null service center', async () => {
    await repository.list({ assignmentStatus: 'ASSIGNED' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          service_center_id: { not: null },
        }),
      }),
    );
  });

  it('creates public evidence assets and claim links in the claim transaction', async () => {
    await repository.createWithAttachments({} as never, [
      {
        accessType: asset_access_type.PUBLIC,
        filename: 'stored.webp',
        folder: 'warranty-claims/evidence',
        id: 'asset-id',
        mimeType: 'image/webp',
        originalName: 'damage.webp',
        path: 'public/warranty-claims/evidence/stored.webp',
        size: 1024,
        type: asset_type.IMAGE,
      },
    ]);

    expect(createAssets).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          access_type: asset_access_type.PUBLIC,
          id: 'asset-id',
          mime_type: 'image/webp',
          uploaded_by_id: null,
        }),
      ],
    });
    expect(createAssetLinks).toHaveBeenCalledWith({
      data: [
        {
          asset_id: 'asset-id',
          entity_id: 'claim-id',
          entity_type: 'warranty_claim',
        },
      ],
    });
    expect(findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'claim-id' } }),
    );
  });
});
