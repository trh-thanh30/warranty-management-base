import { WarrantyActivationRequestQueries } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.queries';
import { Prisma, warranty_activation_request_status } from '@prisma/client';

const activationReviewRequestInclude = {
  activated_warranty: true,
  items: {
    include: { product: { include: { warranty: true } } },
    orderBy: [{ created_at: 'asc' as const }, { id: 'asc' as const }],
  },
} satisfies Prisma.WarrantyActivationRequestInclude;

export class WarrantyActivationReviewTransactionRepository {
  constructor(
    private readonly tx: Prisma.TransactionClient,
    private readonly queries: WarrantyActivationRequestQueries,
  ) {}

  findRequest(id: string) {
    return this.tx.warrantyActivationRequest.findUnique({
      where: { id },
      include: activationReviewRequestInclude,
    });
  }

  findLegacyProduct(warrantyCode: string) {
    return this.tx.product.findFirst({
      where: { warranty: { warranty_code: warrantyCode } },
      include: { warranty: true },
    });
  }

  findCustomerById(id: string) {
    return this.tx.customer.findUnique({ where: { id } });
  }

  findCustomerByPhone(phone: string) {
    return this.tx.customer.findUnique({ where: { phone } });
  }

  findCustomerByEmail(email: string) {
    return this.tx.customer.findUnique({ where: { email } });
  }

  findLastCustomerCode(prefix: string) {
    return this.tx.customer.findFirst({
      where: { customer_code: { startsWith: prefix } },
      orderBy: { customer_code: 'desc' },
      select: { customer_code: true },
    });
  }

  updateCustomer(id: string, data: Prisma.CustomerUncheckedUpdateInput) {
    return this.tx.customer.update({ where: { id }, data });
  }

  createCustomer(data: Prisma.CustomerUncheckedCreateInput) {
    return this.tx.customer.create({ data });
  }

  closeCurrentOwnerships(productId: string, endedAt: Date) {
    return this.tx.productOwnership.updateMany({
      where: { product_id: productId, is_current_owner: true },
      data: { ended_at: endedAt, is_current_owner: false },
    });
  }

  createOwnership(input: {
    customerId: string;
    ownerUserId?: string | null;
    productId: string;
    purchaseDate: Date;
  }) {
    return this.tx.productOwnership.create({
      data: {
        activated_at: null,
        customer: { connect: { id: input.customerId } },
        is_current_owner: true,
        owner_user: input.ownerUserId
          ? { connect: { id: input.ownerUserId } }
          : undefined,
        product: { connect: { id: input.productId } },
        purchase_date: input.purchaseDate,
      },
    });
  }

  findWarrantyForActivation(warrantyId: string) {
    return this.tx.warranty.findUnique({
      where: { id: warrantyId },
      include: {
        product: {
          include: {
            ownerships: {
              where: { is_current_owner: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  transitionWarranty(
    where: Prisma.WarrantyWhereInput,
    data: Prisma.WarrantyUncheckedUpdateManyInput,
  ) {
    return this.tx.warranty.updateMany({ where, data });
  }

  markOwnershipActivated(ownershipId: string, activatedAt: Date) {
    return this.tx.productOwnership.update({
      where: { id: ownershipId },
      data: { activated_at: activatedAt },
    });
  }

  findWarrantyByIdOrThrow(warrantyId: string) {
    return this.tx.warranty.findUniqueOrThrow({ where: { id: warrantyId } });
  }

  markItemsActivated(requestId: string, activatedAt: Date) {
    return this.tx.warrantyActivationRequestItem.updateMany({
      where: { request_id: requestId },
      data: {
        activated_at: activatedAt,
        status: warranty_activation_request_status.ACTIVATED,
      },
    });
  }

  completeActivation(input: {
    activatedWarrantyId: string;
    adminNote?: string;
    customerId: string;
    id: string;
    reviewedAt: Date;
    reviewedById?: string;
  }) {
    return this.tx.warrantyActivationRequest.update({
      where: { id: input.id },
      data: {
        activated_warranty: { connect: { id: input.activatedWarrantyId } },
        admin_note: input.adminNote,
        customer: { connect: { id: input.customerId } },
        reviewed_at: input.reviewedAt,
        reviewed_by: input.reviewedById
          ? { connect: { id: input.reviewedById } }
          : undefined,
        status: warranty_activation_request_status.ACTIVATED,
      },
      include: this.queries.include,
    });
  }
}
