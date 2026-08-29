import {
  ManualActivationProduct,
  WarrantyActivationCandidate,
  WarrantyActivationRequestStatus,
  WarrantyClaimStatus,
  WarrantyCustomer,
  WarrantyRecord,
  WarrantyVoidCandidate,
  toWarrantyRecord,
} from '@/modules/warranties/warranties.types';
import { getProductCatalogue } from '@/modules/products/product-catalogue';
import {
  category_type,
  Customer,
  Prisma,
  product_status,
  warranty_status,
} from '@prisma/client';

const manualActivationProductInclude = {
  ownerships: {
    include: { customer: true },
    orderBy: { created_at: 'desc' as const },
  },
  warranty: true,
  template: true,
} satisfies Prisma.ProductInclude;

type PersistedManualActivationProduct = Prisma.ProductGetPayload<{
  include: typeof manualActivationProductInclude;
}>;

export class WarrantyTransactionRepository {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  async findCustomerByEmail(email: string): Promise<WarrantyCustomer | null> {
    const customer = await this.tx.customer.findUnique({ where: { email } });
    return customer ? this.toWarrantyCustomer(customer) : null;
  }

  async findCustomerByPhone(phone: string): Promise<WarrantyCustomer | null> {
    const customer = await this.tx.customer.findUnique({ where: { phone } });
    return customer ? this.toWarrantyCustomer(customer) : null;
  }

  updateCustomer(
    id: string,
    data: {
      address: string;
      email: string;
      fullName: string;
      phone: string;
    },
  ): Promise<WarrantyCustomer> {
    return this.tx.customer
      .update({
        where: { id },
        data: {
          address: data.address,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone,
        },
      })
      .then((customer) => this.toWarrantyCustomer(customer));
  }

  createCustomer(data: {
    address: string;
    customerCode: string;
    email: string;
    fullName: string;
    phone: string;
  }): Promise<WarrantyCustomer> {
    return this.tx.customer
      .create({
        data: {
          address: data.address,
          customer_code: data.customerCode,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone,
        },
      })
      .then((customer) => this.toWarrantyCustomer(customer));
  }

  async findManualActivationProduct(
    id: string,
  ): Promise<ManualActivationProduct | null> {
    const product = await this.tx.product.findUnique({
      where: { id },
      include: manualActivationProductInclude,
    });
    return product ? this.toManualActivationProduct(product) : null;
  }

  async isActiveProductCategory(categoryId: string): Promise<boolean> {
    const category = await this.tx.category.findFirst({
      where: {
        id: categoryId,
        is_active: true,
        type: category_type.PRODUCT,
      },
      select: { id: true },
    });

    return category !== null;
  }

  closeCurrentOwnerships(productId: string, endedAt: Date) {
    return this.tx.productOwnership.updateMany({
      where: { product_id: productId, is_current_owner: true },
      data: { ended_at: endedAt, is_current_owner: false },
    });
  }

  updateManualActivationProduct(input: {
    customerId: string;
    ownerUserId?: string | null;
    productId: string;
    purchaseDate: Date;
    serialNumber?: string;
    displayName?: string;
    warrantyCode: string;
    warrantyDurationMonths: number;
    warrantyTerms?: string;
  }): Promise<ManualActivationProduct> {
    return this.tx.product
      .update({
        where: { id: input.productId },
        data: {
          serial_number: input.serialNumber,
          display_name: input.displayName,
          status: product_status.ACTIVE,
          ownerships: {
            create: {
              customer: { connect: { id: input.customerId } },
              owner_user: input.ownerUserId
                ? { connect: { id: input.ownerUserId } }
                : undefined,
              purchase_date: input.purchaseDate,
              activated_at: null,
              is_current_owner: true,
            },
          },
          warranty: {
            update: {
              warranty_code: input.warrantyCode,
              duration_months: input.warrantyDurationMonths,
              terms: input.warrantyTerms,
              metadata: {
                source: 'manual_warranty_activation',
                certificateEmailStatus: 'PENDING_TEMPLATE',
              },
            },
          },
        },
        include: manualActivationProductInclude,
      })
      .then((product) => this.toManualActivationProduct(product));
  }

  createManualActivationProduct(input: {
    brand?: string;
    categoryId: string;
    customerId: string;
    displayName?: string;
    ownerUserId?: string | null;
    model?: string;
    name: string;
    productCode: string;
    purchaseDate: Date;
    serialNumber?: string;
    warrantyCode: string;
    warrantyDurationMonths: number;
    warrantyTerms?: string;
  }): Promise<ManualActivationProduct> {
    return this.tx.product
      .create({
        data: {
          product_code: input.productCode,
          serial_number: input.serialNumber,
          display_name: input.displayName,
          catalogue_name: input.name,
          catalogue_sku: input.productCode,
          catalogue_slug: input.productCode.toLowerCase(),
          catalogue_brand: input.brand,
          catalogue_model: input.model,
          category_ref: { connect: { id: input.categoryId } },
          status: product_status.ACTIVE,
          metadata: { source: 'manual_warranty_activation' },
          ownerships: {
            create: {
              customer: { connect: { id: input.customerId } },
              owner_user: input.ownerUserId
                ? { connect: { id: input.ownerUserId } }
                : undefined,
              purchase_date: input.purchaseDate,
              activated_at: null,
              is_current_owner: true,
            },
          },
          warranty: {
            create: {
              warranty_code: input.warrantyCode,
              duration_months: input.warrantyDurationMonths,
              status: warranty_status.DRAFT,
              terms: input.warrantyTerms,
              metadata: {
                source: 'manual_warranty_activation',
                certificateEmailStatus: 'PENDING_TEMPLATE',
              },
            },
          },
        },
        include: manualActivationProductInclude,
      })
      .then((product) => this.toManualActivationProduct(product));
  }

  async findWarrantyByCode(
    warrantyCode: string,
  ): Promise<{ productId: string } | null> {
    const warranty = await this.tx.warranty.findUnique({
      where: { warranty_code: warrantyCode },
      select: { product_id: true },
    });
    return warranty ? { productId: warranty.product_id } : null;
  }

  findProductBySerialNumber(
    serialNumber: string,
  ): Promise<{ id: string } | null> {
    return this.tx.product.findUnique({
      where: { serial_number: serialNumber },
      select: { id: true },
    });
  }

  async findWarrantyForActivation(
    warrantyId: string,
  ): Promise<WarrantyActivationCandidate | null> {
    const warranty = await this.tx.warranty.findUnique({
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
    return warranty
      ? {
          currentOwnershipId: warranty.product.ownerships[0]?.id ?? null,
          durationMonths: warranty.duration_months,
          id: warranty.id,
          status: warranty.status,
          warrantyCode: warranty.warranty_code,
        }
      : null;
  }

  activateDraftWarranty(input: {
    activatedByUserId?: string;
    endDate: Date;
    startDate: Date;
    warrantyId: string;
  }) {
    return this.tx.warranty.updateMany({
      where: { id: input.warrantyId, status: warranty_status.DRAFT },
      data: {
        activated_by_id: input.activatedByUserId,
        end_date: input.endDate,
        start_date: input.startDate,
        status: warranty_status.ACTIVE,
      },
    });
  }

  voidEligibleWarranty(input: {
    reason: string;
    voidedAt: Date;
    voidedByUserId: string;
    warrantyId: string;
  }) {
    return this.tx.warranty.updateMany({
      where: {
        id: input.warrantyId,
        status: { in: [warranty_status.DRAFT, warranty_status.ACTIVE] },
      },
      data: {
        status: warranty_status.VOIDED,
        void_reason: input.reason,
        voided_at: input.voidedAt,
        voided_by_id: input.voidedByUserId,
      },
    });
  }

  markOwnershipActivated(ownershipId: string, activatedAt: Date) {
    return this.tx.productOwnership.update({
      where: { id: ownershipId },
      data: { activated_at: activatedAt },
    });
  }

  async findWarrantyByIdOrThrow(warrantyId: string): Promise<WarrantyRecord> {
    const warranty = await this.tx.warranty.findUniqueOrThrow({
      where: { id: warrantyId },
    });
    return toWarrantyRecord(warranty);
  }

  async findWarrantyForVoid(
    warrantyId: string,
  ): Promise<WarrantyVoidCandidate | null> {
    const warranty = await this.tx.warranty.findUnique({
      where: { id: warrantyId },
      select: { id: true, status: true, warranty_code: true },
    });
    return warranty
      ? {
          id: warranty.id,
          status: warranty.status,
          warrantyCode: warranty.warranty_code,
        }
      : null;
  }

  countOpenClaims(warrantyId: string, statuses: WarrantyClaimStatus[]) {
    return this.tx.warrantyClaim.count({
      where: { warranty_id: warrantyId, status: { in: statuses } },
    });
  }

  findOpenActivationRequestIds(
    warrantyId: string,
    warrantyCode: string,
    statuses: WarrantyActivationRequestStatus[],
  ) {
    return this.tx.warrantyActivationRequest.findMany({
      where: {
        status: { in: statuses },
        OR: [
          { warranty_code: warrantyCode },
          { items: { some: { warranty_id: warrantyId } } },
        ],
      },
      select: { id: true },
    });
  }

  cancelActivationRequestItems(
    requestIds: string[],
    status: WarrantyActivationRequestStatus,
  ) {
    return this.tx.warrantyActivationRequestItem.updateMany({
      where: { request_id: { in: requestIds } },
      data: { status },
    });
  }

  cancelActivationRequests(input: {
    adminNote: string;
    requestIds: string[];
    reviewedAt: Date;
    reviewedById: string;
    status: WarrantyActivationRequestStatus;
  }) {
    return this.tx.warrantyActivationRequest.updateMany({
      where: { id: { in: input.requestIds } },
      data: {
        admin_note: input.adminNote,
        reviewed_at: input.reviewedAt,
        reviewed_by_id: input.reviewedById,
        status: input.status,
      },
    });
  }

  private toWarrantyCustomer(customer: Customer): WarrantyCustomer {
    return {
      address: customer.address,
      customerCode: customer.customer_code,
      email: customer.email,
      fullName: customer.full_name,
      id: customer.id,
      phone: customer.phone,
      userId: customer.user_id,
    };
  }
  private toManualActivationProduct(
    product: PersistedManualActivationProduct,
  ): ManualActivationProduct {
    return {
      deletedAt: product.deleted_at,
      displayName: product.display_name,
      id: product.id,
      ownerships: product.ownerships.map((ownership) => ({
        customer: {
          address: ownership.customer.address,
          customerCode: ownership.customer.customer_code,
          email: ownership.customer.email,
          fullName: ownership.customer.full_name,
          id: ownership.customer.id,
          phone: ownership.customer.phone,
        },
        isCurrentOwner: ownership.is_current_owner,
      })),
      productCode: product.product_code,
      serialNumber: product.serial_number,
      catalogue: {
        brand: getProductCatalogue(product).brand,
        model: getProductCatalogue(product).model,
        name: getProductCatalogue(product).name,
      },
      warranty: product.warranty ? toWarrantyRecord(product.warranty) : null,
    };
  }
}
