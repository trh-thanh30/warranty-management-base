import { NotFoundError } from '@/common/response';
import { LinkWarrantyClaimAssetUseCase } from '@/modules/warranty-claims/use-cases/link-warranty-claim-asset.use-case';
import { ListWarrantyClaimAssetsUseCase } from '@/modules/warranty-claims/use-cases/list-warranty-claim-assets.use-case';
import { UnlinkWarrantyClaimAssetUseCase } from '@/modules/warranty-claims/use-cases/unlink-warranty-claim-asset.use-case';
import { asset_access_type, asset_type } from '@prisma/client';

const asset = {
  id: 'asset-id',
  original_name: 'issue.jpg',
  filename: 'issue-123.jpg',
  mime_type: 'image/jpeg',
  size: 1234,
  path: 'claims/issue-123.jpg',
  access_type: asset_access_type.PUBLIC,
  type: asset_type.IMAGE,
  folder: 'claims',
  metadata: {},
  is_deleted: false,
  uploaded_by_id: 'admin-id',
  created_at: new Date('2026-07-03T00:00:00.000Z'),
  updated_at: new Date('2026-07-03T00:00:00.000Z'),
};

describe('Warranty claim asset use cases', () => {
  const warrantyClaimsRepository = {
    findById: jest.fn(),
    findAssetById: jest.fn(),
    linkAssetToClaim: jest.fn(),
    listClaimAssets: jest.fn(),
    unlinkAssetFromClaim: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('links an asset to a claim', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({ id: 'claim-id' });
    warrantyClaimsRepository.findAssetById.mockResolvedValue(asset);
    warrantyClaimsRepository.linkAssetToClaim.mockResolvedValue({ asset });
    const useCase = new LinkWarrantyClaimAssetUseCase(
      warrantyClaimsRepository as never,
    );

    const result = await useCase.execute(
      'claim-id',
      { assetId: 'asset-id', note: 'Anh loi' },
      { linkedByUserId: 'admin-id' },
    );

    expect(warrantyClaimsRepository.linkAssetToClaim).toHaveBeenCalledWith({
      claimId: 'claim-id',
      assetId: 'asset-id',
      note: 'Anh loi',
      linkedByUserId: 'admin-id',
    });
    expect(result.url).toBe('claims/issue-123.jpg');
  });

  it('lists linked claim assets', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({ id: 'claim-id' });
    warrantyClaimsRepository.listClaimAssets.mockResolvedValue([{ asset }]);
    const useCase = new ListWarrantyClaimAssetsUseCase(
      warrantyClaimsRepository as never,
    );

    const result = await useCase.execute('claim-id');

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('asset-id');
  });

  it('throws not found when linking to a missing asset', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({ id: 'claim-id' });
    warrantyClaimsRepository.findAssetById.mockResolvedValue(null);
    const useCase = new LinkWarrantyClaimAssetUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute('claim-id', { assetId: 'missing-asset-id' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('unlinks an asset from a claim', async () => {
    warrantyClaimsRepository.findById.mockResolvedValue({ id: 'claim-id' });
    warrantyClaimsRepository.unlinkAssetFromClaim.mockResolvedValue({
      count: 1,
    });
    const useCase = new UnlinkWarrantyClaimAssetUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.execute('claim-id', 'asset-id')).resolves.toEqual({
      success: true,
    });
  });
});
