import { WarrantyActivationRequestQueries } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.queries';
import {
  activation_code_status,
  Prisma,
  warranty_activation_request_status,
  warranty_method,
} from '@prisma/client';

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
    return this.tx.customer.findFirst({
      where: { phone },
      orderBy: { created_at: 'desc' },
    });
  }

  findCustomersByPhone(phone: string) {
    return this.tx.customer.findMany({
      where: { phone },
      orderBy: { created_at: 'desc' },
    });
  }

  findCustomerByEmail(email: string) {
    return this.tx.customer.findFirst({
      where: { email },
      orderBy: { created_at: 'desc' },
    });
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

  findWarrantyForActivation(warrantyId: string) {
    return this.tx.warranty.findUnique({
      where: { id: warrantyId },
      include: {
        product: true,
        ownerships: {
          where: { is_current_owner: true },
          take: 1,
        },
      },
    });
  }

  assignWarrantyDealer(warrantyId: string, dealerId: string | null) {
    return this.tx.warranty.update({
      where: { id: warrantyId },
      data: { dealer_id: dealerId },
    });
  }

  createWarrantyOwnership(input: {
    customerId: string;
    ownerUserId?: string | null;
    warrantyId: string;
    purchaseDate: Date;
    activatedAt: Date;
  }) {
    return this.tx.warrantyOwnership.create({
      data: {
        customer: { connect: { id: input.customerId } },
        owner_user: input.ownerUserId
          ? { connect: { id: input.ownerUserId } }
          : undefined,
        purchase_date: input.purchaseDate,
        activated_at: input.activatedAt,
        is_current_owner: true,
        warranty: { connect: { id: input.warrantyId } },
      },
    });
  }

  transitionWarranty(
    where: Prisma.WarrantyWhereInput,
    data: Prisma.WarrantyUncheckedUpdateManyInput,
  ) {
    return this.tx.warranty.updateMany({ where, data });
  }

  setCurrentWarranty(productId: string, warrantyId: string) {
    return this.tx.product.update({
      where: { id: productId },
      data: { current_warranty_id: warrantyId },
    });
  }

  findWarrantyByIdOrThrow(warrantyId: string) {
    return this.tx.warranty.findUniqueOrThrow({ where: { id: warrantyId } });
  }

  createWarrantyForActivation(input: {
    activationCodeId: string | null;
    productId: string;
    warrantyCode: string;
    durationMonths: number;
    method?: warranty_method;
    terms?: string | null;
    dealerId?: string | null;
  }) {
    return this.tx.warranty.create({
      data: {
        activation_code: input.activationCodeId
          ? { connect: { id: input.activationCodeId } }
          : undefined,
        duration_months: input.durationMonths,
        product: { connect: { id: input.productId } },
        status: 'DRAFT',
        warranty_code: input.warrantyCode,
        method: input.method ?? warranty_method.REPAIR,
        terms: input.terms ?? undefined,
        dealer: input.dealerId
          ? { connect: { id: input.dealerId } }
          : undefined,
      },
      include: {
        product: {
          include: {
            ownerships: {
              where: { is_current_owner: true },
              take: 1,
            },
          },
        },
        dealer: true,
        ownerships: {
          where: { is_current_owner: true },
          take: 1,
        },
      },
    });
  }

  linkItemWarranty(input: {
    itemId: string;
    warrantyCode: string;
    warrantyId: string;
  }) {
    return this.tx.warrantyActivationRequestItem.update({
      where: { id: input.itemId },
      data: {
        warranty: { connect: { id: input.warrantyId } },
        warranty_code: input.warrantyCode,
      },
    });
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

  markActivationCodeActivated(codeId: string, activatedAt: Date) {
    return this.tx.activationCode.updateMany({
      where: {
        id: codeId,
        status: activation_code_status.PENDING_APPROVAL,
        expires_at: { gt: activatedAt },
        warranty: { is: null },
      },
      data: {
        status: activation_code_status.ACTIVATED,
        activated_at: activatedAt,
      },
    });
  }

  markActivationCodesActivated(codeIds: string[], activatedAt: Date) {
    if (codeIds.length === 0) return Promise.resolve({ count: 0 });
    return this.tx.activationCode.updateMany({
      where: {
        id: { in: codeIds },
        status: activation_code_status.PENDING_APPROVAL,
        expires_at: { gt: activatedAt },
        warranty: { is: null },
      },
      data: {
        status: activation_code_status.ACTIVATED,
        activated_at: activatedAt,
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
