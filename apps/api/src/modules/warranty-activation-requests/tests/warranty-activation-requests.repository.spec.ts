import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { warranty_activation_request_status } from '@prisma/client';

describe('WarrantyActivationRequestsRepository', () => {
  it('finds the newest pending or approved request for a product', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const prismaService = {
      warrantyActivationRequest: { findFirst },
    };
    const repository = new WarrantyActivationRequestsRepository(
      prismaService as never,
      {} as never,
      {} as never,
    );

    await repository.findOpenByProductId('product-id');

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        product_id: 'product-id',
        status: {
          in: [
            warranty_activation_request_status.PENDING,
            warranty_activation_request_status.APPROVED,
          ],
        },
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        request_code: true,
        status: true,
      },
    });
  });
});
