import { GetProductCloneDraftUseCase } from '@/modules/products/use-cases/get-product-clone-draft.use-case';

describe('GetProductCloneDraftUseCase', () => {
  it('clears operational identifiers while preserving editable content', async () => {
    const source = {
      id: 'product-id',
      productCode: 'SKU-001',
      serialNumber: 'SERIAL-001',
      warrantyCode: 'WM-001',
      deletedAt: null,
      status: 'ACTIVE',
      categoryRef: { isActive: true },
      name: 'Product',
      warranty: { warrantyCode: 'WM-001', status: 'ACTIVE' },
    };
    const useCase = new GetProductCloneDraftUseCase(
      {
        execute: jest.fn().mockResolvedValue(source),
      } as never,
      { activityLog: { create: jest.fn() } } as never,
    );

    await expect(useCase.execute('product-id')).resolves.toMatchObject({
      name: 'Product',
      productCode: null,
      serialNumber: null,
      warrantyCode: null,
      owner: null,
      warranty: { warrantyCode: null, status: 'DRAFT' },
    });
  });

  it('rejects deleted products', async () => {
    const useCase = new GetProductCloneDraftUseCase(
      {
        execute: jest
          .fn()
          .mockResolvedValue({ status: 'DELETED', deletedAt: new Date() }),
      } as never,
      { activityLog: { create: jest.fn() } } as never,
    );

    await expect(useCase.execute('deleted-id')).rejects.toThrow(
      'Product not found',
    );
  });
});
