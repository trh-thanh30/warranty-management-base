import { getProductCatalogue } from '@/modules/products/product-catalogue';
import {
  ManualActivationProduct,
  toWarrantyRecord,
  WarrantyActivationCandidate,
  WarrantyActivationRequestStatus,
  WarrantyClaimStatus,
  WarrantyCustomer,
  WarrantyRecord,
  WarrantyVoidCandidate,
} from '@/modules/warranties/warranties.types';
import {
  category_type,
  Customer,
  Prisma,
  product_status,
  warranty_status,
} from '@prisma/client';

const manualActivationProductInclude = {
  warranty: true,
  warranties: {
    include: {
      ownerships: {
        where: { is_current_owner: true },
        include: { customer: true },
        take: 1,
      },
    },
    orderBy: { created_at: 'desc' as const },
    take: 1,
  },
} satisfies Prisma.ProductInclude;

type PersistedManualActivationProduct = Prisma.ProductGetPayload<{
  include: typeof manualActivationProductInclude;
}>;

export class WarrantyTransactionRepository {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  async transferWarrantyOwnership(input: {
    customerId: string;
    purchaseDate: Date | null;
    warrantyId: string;
  }) {
    const [warranty, customer] = await Promise.all([
      this.tx.warranty.findUnique({
        where: { id: input.warrantyId },
        include: {
          activated_by: true,
          voided_by: true,
          dealer: true,
          ownerships: {
            where: { is_current_owner: true },
            include: { customer: true },
            orderBy: { created_at: 'desc' },
          },
          product: {
            include: { category_ref: true },
          },
        },
      }),
      this.tx.customer.findUnique({ where: { id: input.customerId } }),
    ]);

    if (!warranty) throw new Error('Warranty not found');
    if (!customer) throw new Error('Customer not found');

    const current = warranty.ownerships.find(
      (ownership) => ownership.is_current_owner,
    );
    if (current?.customer_id === customer.id) return warranty;

    const now = new Date();
    await this.tx.warrantyOwnership.updateMany({
      where: { warranty_id: input.warrantyId, is_current_owner: true },
      data: { is_current_owner: false, ended_at: now },
    });
    await this.tx.warrantyOwnership.create({
      data: {
        warranty_id: input.warrantyId,
        customer_id: customer.id,
        owner_user_id: customer.user_id ?? null,
        purchase_date: input.purchaseDate,
        activated_at: warranty.start_date,
        is_current_owner: true,
      },
    });

    return this.tx.warranty.findUniqueOrThrow({
      where: { id: input.warrantyId },
      include: {
        activated_by: true,
        voided_by: true,
        dealer: true,
        ownerships: {
          where: { is_current_owner: true },
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
        product: {
          include: { category_ref: true },
        },
      },
    });
  }

  async findCustomerByEmail(email: string): Promise<WarrantyCustomer | null> {
    const customer = await this.tx.customer.findFirst({
      where: { email },
      orderBy: { created_at: 'desc' },
    });
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

  async createCustomer(data: {
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

  async updateManualActivationProduct(input: {
    customerId: string;
    ownerUserId?: string | null;
    productId: string;
    purchaseDate: Date;
    displayName?: string;
    warrantyCode: string;
    warrantyDurationMonths: number;
    warrantyTerms?: string;
  }): Promise<ManualActivationProduct> {
    await this.tx.product.update({
      where: { id: input.productId },
      data: {
        display_name: input.displayName,
        status: product_status.ACTIVE,
      },
    });
    const warranty = await this.tx.warranty.create({
      data: {
        product_id: input.productId,
        serial_number: null,
        warranty_code: input.warrantyCode,
        duration_months: input.warrantyDurationMonths,
        status: warranty_status.DRAFT,
        terms: input.warrantyTerms,
        metadata: {
          source: 'manual_warranty_activation',
          certificateEmailStatus: 'PENDING_TEMPLATE',
        },
        ownerships: {
          create: {
            customer_id: input.customerId,
            owner_user_id: input.ownerUserId,
            purchase_date: input.purchaseDate,
            is_current_owner: true,
          },
        },
      },
    });
    await this.tx.product.update({
      where: { id: input.productId },
      data: { current_warranty_id: warranty.id },
    });
    const product = await this.tx.product.findUniqueOrThrow({
      where: { id: input.productId },
      include: manualActivationProductInclude,
    });
    return this.toManualActivationProduct(product);
  }

  async createManualActivationProduct(input: {
    brand?: string;
    categoryId: string;
    customerId: string;
    displayName?: string;
    ownerUserId?: string | null;
    model?: string;
    name: string;
    productCode: string;
    purchaseDate: Date;
    warrantyCode: string;
    warrantyDurationMonths: number;
    warrantyTerms?: string;
  }): Promise<ManualActivationProduct> {
    const product = await this.tx.product.create({
      data: {
        product_code: input.productCode,
        display_name: input.name,
        slug: input.productCode.toLowerCase(),
        brand: input.brand,
        model: input.model,
        category_ref: { connect: { id: input.categoryId } },
        status: product_status.ACTIVE,
        metadata: { source: 'manual_warranty_activation' },
        warranties: {
          create: {
            serial_number: null,
            warranty_code: input.warrantyCode,
            duration_months: input.warrantyDurationMonths,
            status: warranty_status.DRAFT,
            terms: input.warrantyTerms,
            metadata: {
              source: 'manual_warranty_activation',
              certificateEmailStatus: 'PENDING_TEMPLATE',
            },
            ownerships: {
              create: {
                customer_id: input.customerId,
                owner_user_id: input.ownerUserId,
                purchase_date: input.purchaseDate,
                is_current_owner: true,
              },
            },
          },
        },
      },
      include: manualActivationProductInclude,
    });
    const warranty = product.warranties[0];
    if (warranty) {
      await this.tx.product.update({
        where: { id: product.id },
        data: { current_warranty_id: warranty.id },
      });
    }
    return this.toManualActivationProduct(product);
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

  async findWarrantyForActivation(
    warrantyId: string,
  ): Promise<WarrantyActivationCandidate | null> {
    const warranty = await this.tx.warranty.findUnique({
      where: { id: warrantyId },
      include: {
        ownerships: {
          where: { is_current_owner: true },
          take: 1,
        },
      },
    });
    return warranty
      ? {
          currentOwnershipId: warranty.ownerships[0]?.id ?? null,
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
    return this.tx.warrantyOwnership.update({
      where: { id: ownershipId },
      data: { activated_at: activatedAt },
    });
  }

  async findWarrantyByIdOrThrow(warrantyId: string): Promise<WarrantyRecord> {
    const warranty = await this.tx.warranty.findUniqueOrThrow({
      where: { id: warrantyId },
      include: {
        dealer: true,
        ownerships: {
          where: { is_current_owner: true },
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
      },
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
      ownerships: (product.warranties[0]?.ownerships ?? []).map(
        (ownership) => ({
          customer: {
            address: ownership.customer.address,
            customerCode: ownership.customer.customer_code,
            email: ownership.customer.email,
            fullName: ownership.customer.full_name,
            id: ownership.customer.id,
            phone: ownership.customer.phone,
          },
          isCurrentOwner: ownership.is_current_owner,
        }),
      ),
      productCode: product.product_code,
      serialNumber: product.warranties[0]?.serial_number ?? null,
      catalogue: {
        brand: getProductCatalogue(product).brand,
        model: getProductCatalogue(product).model,
        name: getProductCatalogue(product).name,
      },
      warranty:
        (product.warranty ?? product.warranties[0])
          ? toWarrantyRecord(product.warranty ?? product.warranties[0]!)
          : null,
    };
  }
}
