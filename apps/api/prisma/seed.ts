import { PrismaPg } from '@prisma/adapter-pg';
import {
  category_type,
  notification_delivery_status,
  notification_read_status,
  notification_scope,
  notification_source,
  Prisma,
  PrismaClient,
  product_category,
  product_status,
  warranty_activation_request_source,
  warranty_activation_request_status,
  warranty_claim_priority,
  warranty_claim_status,
  warranty_status,
} from '@prisma/client';
import { Pool } from 'pg';
import { NOTIFICATION_TYPES } from '@repo/shared/constants';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { seedAdminUsers } from './seed-admin';
import { seedPolicyContentPages } from './seed-content-pages';
import { seedWebsiteConfigDrafts } from './seed-website-config';

type DashboardWarrantyChartSeed = {
  offsetDays: number;
  copies: number;
  statuses: Array<keyof typeof warranty_status>;
};

type DashboardActivationRequestChartSeed = {
  offsetDays: number;
  copies: number;
  statuses: Array<keyof typeof warranty_activation_request_status>;
};

const parsedDashboardWarrantyChartSeed: unknown = JSON.parse(
  readFileSync(join(__dirname, 'dashboard-warranty-chart.seed.json'), 'utf8'),
);

const parsedDashboardActivationRequestChartSeed: unknown = JSON.parse(
  readFileSync(
    join(__dirname, 'dashboard-activation-request-chart.seed.json'),
    'utf8',
  ),
);

function isDashboardWarrantyChartSeed(
  value: unknown,
): value is DashboardWarrantyChartSeed {
  if (!value || typeof value !== 'object') return false;
  const offsetDays: unknown = Reflect.get(value, 'offsetDays');
  const copies: unknown = Reflect.get(value, 'copies');
  const statuses: unknown = Reflect.get(value, 'statuses');

  return (
    typeof offsetDays === 'number' &&
    typeof copies === 'number' &&
    copies > 0 &&
    Array.isArray(statuses) &&
    statuses.every(
      (status) =>
        typeof status === 'string' &&
        Object.prototype.hasOwnProperty.call(warranty_status, status),
    )
  );
}

function isDashboardActivationRequestChartSeed(
  value: unknown,
): value is DashboardActivationRequestChartSeed {
  if (!value || typeof value !== 'object') return false;
  const offsetDays: unknown = Reflect.get(value, 'offsetDays');
  const copies: unknown = Reflect.get(value, 'copies');
  const statuses: unknown = Reflect.get(value, 'statuses');

  return (
    typeof offsetDays === 'number' &&
    typeof copies === 'number' &&
    copies > 0 &&
    Array.isArray(statuses) &&
    statuses.every(
      (status) =>
        typeof status === 'string' &&
        Object.prototype.hasOwnProperty.call(
          warranty_activation_request_status,
          status,
        ),
    )
  );
}

const dashboardWarrantyChartSeed = Array.isArray(
  parsedDashboardWarrantyChartSeed,
)
  ? parsedDashboardWarrantyChartSeed.filter(isDashboardWarrantyChartSeed)
  : [];

const dashboardActivationRequestChartSeed = Array.isArray(
  parsedDashboardActivationRequestChartSeed,
)
  ? parsedDashboardActivationRequestChartSeed.filter(
      isDashboardActivationRequestChartSeed,
    )
  : [];

let prisma: PrismaClient;

type DemoNotificationRecipient = {
  userId: string;
  status: notification_read_status;
  readAt?: Date | null;
};

async function upsertDemoNotification(data: {
  id: string;
  title: string;
  content: string;
  type: string;
  source: notification_source;
  scope: notification_scope;
  deliveryStatus: notification_delivery_status;
  createdById?: string | null;
  sentAt?: Date | null;
  scheduledAt?: Date | null;
  metadata?: Prisma.InputJsonValue;
  recipients?: DemoNotificationRecipient[];
}) {
  const notification = await prisma.notification.upsert({
    where: { id: data.id },
    update: {
      title: data.title,
      content: data.content,
      type: data.type,
      source: data.source,
      scope: data.scope,
      delivery_status: data.deliveryStatus,
      created_by_id: data.createdById ?? null,
      sent_at: data.sentAt ?? null,
      scheduled_at: data.scheduledAt ?? null,
      metadata: data.metadata,
    },
    create: {
      id: data.id,
      title: data.title,
      content: data.content,
      type: data.type,
      source: data.source,
      scope: data.scope,
      delivery_status: data.deliveryStatus,
      created_by_id: data.createdById ?? null,
      sent_at: data.sentAt ?? null,
      scheduled_at: data.scheduledAt ?? null,
      metadata: data.metadata,
    },
  });

  await Promise.all(
    (data.recipients ?? []).map((recipient) =>
      prisma.notificationRecipient.upsert({
        where: {
          notification_id_user_id: {
            notification_id: notification.id,
            user_id: recipient.userId,
          },
        },
        update: {
          status: recipient.status,
          read_at: recipient.readAt ?? null,
          delivered_at: data.sentAt ?? new Date(),
        },
        create: {
          notification_id: notification.id,
          user_id: recipient.userId,
          status: recipient.status,
          read_at: recipient.readAt ?? null,
          delivered_at: data.sentAt ?? new Date(),
        },
      }),
    ),
  );

  return notification;
}

async function upsertCustomer(data: {
  userId?: string | null;
  customerCode: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  return prisma.customer.upsert({
    where: { customer_code: data.customerCode },
    update: {
      user_id: data.userId,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address,
    },
    create: {
      user_id: data.userId,
      customer_code: data.customerCode,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address,
    },
  });
}

async function upsertDemoProduct(data: {
  productCode: string;
  warrantyCode: string;
  serialNumber: string;
  name: string;
  category: product_category;
  brand: string;
  model: string;
  manufactureYear: number;
  customerId: string;
  ownerUserId?: string | null;
  purchaseDate: Date;
  durationMonths: number;
  warrantyStatus: warranty_status;
}) {
  const category = await prisma.category.findFirst({
    where: { type: category_type.PRODUCT, code: data.category },
  });
  if (!category) {
    throw new Error(`Product category ${data.category} must be seeded first`);
  }

  const templateSku = `DEMO-${data.productCode}`;
  const template = await prisma.productTemplate.upsert({
    where: { sku: templateSku },
    update: {
      name: data.name,
      brand: data.brand,
      model: data.model,
      model_year: data.manufactureYear,
      category_id: category.id,
      default_warranty_duration_months: data.durationMonths,
      is_active: true,
    },
    create: {
      sku: templateSku,
      slug: data.productCode.toLowerCase(),
      name: data.name,
      brand: data.brand,
      model: data.model,
      model_year: data.manufactureYear,
      category_id: category.id,
      default_warranty_duration_months: data.durationMonths,
      is_active: true,
    },
  });

  const product = await prisma.product.upsert({
    where: { product_code: data.productCode },
    update: {
      serial_number: data.serialNumber,
      template_id: template.id,
      category_id: template.category_id,
      status: product_status.ACTIVE,
      deleted_at: null,
    },
    create: {
      product_code: data.productCode,
      serial_number: data.serialNumber,
      template_id: template.id,
      category_id: template.category_id,
      status: product_status.ACTIVE,
    },
    include: { template: true },
  });

  const endDate = new Date(data.purchaseDate);
  endDate.setMonth(endDate.getMonth() + data.durationMonths);

  const warranty = await prisma.warranty.upsert({
    where: { product_id: product.id },
    update: {
      warranty_code: data.warrantyCode,
      start_date: data.purchaseDate,
      end_date: endDate,
      duration_months: data.durationMonths,
      status: data.warrantyStatus,
    },
    create: {
      product_id: product.id,
      warranty_code: data.warrantyCode,
      start_date: data.purchaseDate,
      end_date: endDate,
      duration_months: data.durationMonths,
      status: data.warrantyStatus,
    },
  });

  await prisma.productOwnership.updateMany({
    where: { product_id: product.id, is_current_owner: true },
    data: {
      is_current_owner: false,
      ended_at: new Date(),
    },
  });

  await prisma.productOwnership.create({
    data: {
      product_id: product.id,
      customer_id: data.customerId,
      owner_user_id: data.ownerUserId ?? null,
      purchase_date: data.purchaseDate,
      activated_at: data.purchaseDate,
      is_current_owner: true,
    },
  });

  return {
    product,
    warranty: { ...warranty, warranty_code: data.warrantyCode },
  };
}

async function upsertDemoServiceCenter(data: {
  id: string;
  name: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  address: string;
}) {
  return prisma.serviceCenter.upsert({
    where: { id: data.id },
    update: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      province: data.province,
      district: data.district,
      address: data.address,
      is_active: true,
    },
    create: {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      province: data.province,
      district: data.district,
      address: data.address,
      is_active: true,
    },
  });
}

async function upsertDemoDealer(data: {
  id: string;
  name: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  salesName?: string | null;
}) {
  return prisma.dealer.upsert({
    where: { id: data.id },
    update: {
      name: data.name,
      phone: data.phone,
      province: data.province,
      district: data.district,
      address: data.address,
      sales_name: data.salesName ?? null,
      is_active: true,
    },
    create: {
      id: data.id,
      name: data.name,
      phone: data.phone,
      province: data.province,
      district: data.district,
      address: data.address,
      sales_name: data.salesName ?? null,
      is_active: true,
    },
  });
}

async function upsertDemoWarrantyActivationRequest(data: {
  requestCode: string;
  status: warranty_activation_request_status;
  source: warranty_activation_request_source;
  warrantyCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerId?: string | null;
  categoryId?: string | null;
  productId?: string | null;
  dealerId?: string | null;
  vehiclePlate?: string | null;
  vehicleModel?: string | null;
  installedAt?: Date | null;
  warrantyDurationMonths?: number | null;
  productName?: string | null;
  serialNumber?: string | null;
  brand?: string | null;
  model?: string | null;
  manufactureYear?: number | null;
  note?: string | null;
  adminNote?: string | null;
  rejectionReason?: string | null;
  createdById?: string | null;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
  activatedWarrantyId?: string | null;
  createdAt: Date;
}) {
  return prisma.warrantyActivationRequest.upsert({
    where: { request_code: data.requestCode },
    update: {
      status: data.status,
      source: data.source,
      warranty_code: data.warrantyCode,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail ?? null,
      customer_id: data.customerId ?? null,
      category_id: data.categoryId ?? null,
      product_id: data.productId ?? null,
      dealer_id: data.dealerId ?? null,
      vehicle_plate: data.vehiclePlate ?? null,
      vehicle_model: data.vehicleModel ?? null,
      installed_at: data.installedAt ?? null,
      warranty_duration_months: data.warrantyDurationMonths ?? null,
      province_code: '01',
      province_name: 'Ha Noi',
      ward_code: '001',
      ward_name: 'Phuong Cau Giay',
      address_detail: '123 Tran Duy Hung',
      full_address: '123 Tran Duy Hung, Phuong Cau Giay, Ha Noi',
      product_name: data.productName ?? null,
      serial_number: data.serialNumber ?? null,
      brand: data.brand ?? null,
      model: data.model ?? null,
      manufacture_year: data.manufactureYear ?? null,
      note: data.note ?? null,
      admin_note: data.adminNote ?? null,
      rejection_reason: data.rejectionReason ?? null,
      created_by_id: data.createdById ?? null,
      reviewed_by_id: data.reviewedById ?? null,
      reviewed_at: data.reviewedAt ?? null,
      activated_warranty_id: data.activatedWarrantyId ?? null,
      created_at: data.createdAt,
    },
    create: {
      request_code: data.requestCode,
      status: data.status,
      source: data.source,
      warranty_code: data.warrantyCode,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail ?? null,
      customer_id: data.customerId ?? null,
      category_id: data.categoryId ?? null,
      product_id: data.productId ?? null,
      dealer_id: data.dealerId ?? null,
      vehicle_plate: data.vehiclePlate ?? null,
      vehicle_model: data.vehicleModel ?? null,
      installed_at: data.installedAt ?? null,
      warranty_duration_months: data.warrantyDurationMonths ?? null,
      province_code: '01',
      province_name: 'Ha Noi',
      ward_code: '001',
      ward_name: 'Phuong Cau Giay',
      address_detail: '123 Tran Duy Hung',
      full_address: '123 Tran Duy Hung, Phuong Cau Giay, Ha Noi',
      product_name: data.productName ?? null,
      serial_number: data.serialNumber ?? null,
      brand: data.brand ?? null,
      model: data.model ?? null,
      manufacture_year: data.manufactureYear ?? null,
      note: data.note ?? null,
      admin_note: data.adminNote ?? null,
      rejection_reason: data.rejectionReason ?? null,
      created_by_id: data.createdById ?? null,
      reviewed_by_id: data.reviewedById ?? null,
      reviewed_at: data.reviewedAt ?? null,
      activated_warranty_id: data.activatedWarrantyId ?? null,
      created_at: data.createdAt,
    },
  });
}

type DemoClaimHistory = {
  fromStatus: warranty_claim_status | null;
  toStatus: warranty_claim_status;
  note: string;
  changedByUserId: string;
  createdAt: Date;
};

async function upsertDemoWarrantyClaim(data: {
  claimCode: string;
  warrantyId: string;
  productId: string;
  customerId: string;
  serviceCenterId?: string | null;
  warrantyCode: string;
  requesterName: string;
  requesterPhone: string;
  issueTitle: string;
  issueDetail: string;
  status: warranty_claim_status;
  priority: warranty_claim_priority;
  dueAt: Date;
  slaBreachedAt?: Date | null;
  submittedAt: Date;
  history: DemoClaimHistory[];
}) {
  const claim = await prisma.warrantyClaim.upsert({
    where: { claim_code: data.claimCode },
    update: {
      warranty_id: data.warrantyId,
      product_id: data.productId,
      customer_id: data.customerId,
      service_center_id: data.serviceCenterId ?? null,
      warranty_code: data.warrantyCode,
      requester_name: data.requesterName,
      requester_phone: data.requesterPhone,
      issue_title: data.issueTitle,
      issue_detail: data.issueDetail,
      status: data.status,
      priority: data.priority,
      due_at: data.dueAt,
      sla_breached_at: data.slaBreachedAt ?? null,
      submitted_at: data.submittedAt,
      resolved_at: null,
    },
    create: {
      claim_code: data.claimCode,
      warranty_id: data.warrantyId,
      product_id: data.productId,
      customer_id: data.customerId,
      service_center_id: data.serviceCenterId ?? null,
      warranty_code: data.warrantyCode,
      requester_name: data.requesterName,
      requester_phone: data.requesterPhone,
      issue_title: data.issueTitle,
      issue_detail: data.issueDetail,
      status: data.status,
      priority: data.priority,
      due_at: data.dueAt,
      sla_breached_at: data.slaBreachedAt ?? null,
      submitted_at: data.submittedAt,
    },
  });

  await prisma.warrantyClaimServiceCenterHistory.deleteMany({
    where: { warranty_claim_id: claim.id },
  });

  await prisma.warrantyClaimStatusHistory.deleteMany({
    where: { warranty_claim_id: claim.id },
  });

  await prisma.warrantyClaimStatusHistory.createMany({
    data: data.history.map((history) => ({
      warranty_claim_id: claim.id,
      from_status: history.fromStatus,
      to_status: history.toStatus,
      note: history.note,
      changed_by_user_id: history.changedByUserId,
      created_at: history.createdAt,
    })),
  });

  return claim;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

async function seedDefaultCategories() {
  const productCategories = [
    {
      code: product_category.CAR,
      slug: 'car',
      name: 'Car',
      description: 'Vehicles covered by warranty.',
      order: 10,
    },
    {
      code: product_category.ACCESSORY,
      slug: 'accessory',
      name: 'Accessory',
      description: 'Vehicle accessories and add-ons.',
      order: 20,
    },
    {
      code: product_category.SPARE_PART,
      slug: 'spare-part',
      name: 'Spare Part',
      description: 'Replacement parts and components.',
      order: 30,
    },
    {
      code: product_category.SERVICE_PACKAGE,
      slug: 'service-package',
      name: 'Service Package',
      description: 'Prepaid or bundled service packages.',
      order: 40,
    },
  ];

  for (const category of productCategories) {
    await prisma.category.upsert({
      where: {
        type_slug: {
          type: category_type.PRODUCT,
          slug: category.slug,
        },
      },
      update: {
        code: category.code,
        name: category.name,
        description: category.description,
        order: category.order,
        is_active: true,
      },
      create: {
        type: category_type.PRODUCT,
        code: category.code,
        slug: category.slug,
        name: category.name,
        description: category.description,
        order: category.order,
        is_active: true,
      },
    });
  }
}

async function main() {
  console.log('Seeding base database...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  await seedWebsiteConfigDrafts(prisma);
  await seedPolicyContentPages(prisma);
  await seedDefaultCategories();

  const { adminUser, customerAUser, customerBUser, moderatorUser } =
    await seedAdminUsers(prisma);

  const customerA = await upsertCustomer({
    userId: customerAUser.id,
    customerCode: 'CUS-DEMO-A',
    fullName: 'Nguyen Van An',
    phone: '0900000001',
    email: customerAUser.email,
    address: 'Ha Noi',
  });

  const customerB = await upsertCustomer({
    userId: customerBUser.id,
    customerCode: 'CUS-DEMO-B',
    fullName: 'Tran Thi Binh',
    phone: '0900000002',
    email: customerBUser.email,
    address: 'Ho Chi Minh City',
  });

  const walkInCustomer = await upsertCustomer({
    userId: null,
    customerCode: 'CUS-WALKIN-001',
    fullName: 'Le Thi Minh',
    phone: '0900000003',
    email: 'walkin.customer@example.com',
    address: 'Da Nang',
  });

  const hanoiServiceCenter = await upsertDemoServiceCenter({
    id: '00000000-0000-4000-8000-000000000201',
    name: 'Hanoi Warranty Center',
    phone: '02473000001',
    email: 'hanoi.service@example.com',
    province: 'Ha Noi',
    district: 'Cau Giay',
    address: '123 Tran Duy Hung, Cau Giay, Ha Noi',
  });

  const hcmServiceCenter = await upsertDemoServiceCenter({
    id: '00000000-0000-4000-8000-000000000202',
    name: 'Ho Chi Minh Warranty Center',
    phone: '02873000002',
    email: 'hcm.service@example.com',
    province: 'Ho Chi Minh City',
    district: 'District 7',
    address: '456 Nguyen Van Linh, District 7, Ho Chi Minh City',
  });

  const danangServiceCenter = await upsertDemoServiceCenter({
    id: '00000000-0000-4000-8000-000000000203',
    name: 'Da Nang Warranty Center',
    phone: '02367300003',
    email: 'danang.service@example.com',
    province: 'Da Nang',
    district: 'Hai Chau',
    address: '789 Nguyen Van Linh, Hai Chau, Da Nang',
  });

  const lexzenzHanoiDealer = await upsertDemoDealer({
    id: '00000000-0000-4000-8000-000000000401',
    name: 'Lexzenz Hanoi Dealer',
    phone: '02473001001',
    province: 'Ha Noi',
    district: 'Cau Giay',
    address: '88 Dich Vong Hau, Cau Giay, Ha Noi',
    salesName: 'Pham Minh Quan',
  });

  const lexzenzHcmDealer = await upsertDemoDealer({
    id: '00000000-0000-4000-8000-000000000402',
    name: 'Lexzenz Ho Chi Minh Dealer',
    phone: '02873001002',
    province: 'Ho Chi Minh City',
    district: 'District 7',
    address: '99 Nguyen Thi Thap, District 7, Ho Chi Minh City',
    salesName: 'Nguyen Hoang Lam',
  });

  const carCategory = await prisma.category.findFirst({
    where: { type: category_type.PRODUCT, code: product_category.CAR },
  });

  const accessoryCategory = await prisma.category.findFirst({
    where: { type: category_type.PRODUCT, code: product_category.ACCESSORY },
  });

  const sparePartCategory = await prisma.category.findFirst({
    where: { type: category_type.PRODUCT, code: product_category.SPARE_PART },
  });

  const seedNow = new Date();

  const camryDemo = await upsertDemoProduct({
    productCode: 'PRD-2026-CAMRY',
    warrantyCode: 'WM-2026-CAMRYA',
    serialNumber: 'VIN-CAMRY-A-2026',
    name: 'Toyota Camry 2.5Q',
    category: product_category.CAR,
    brand: 'Toyota',
    model: 'Camry',
    manufactureYear: 2026,
    customerId: customerA.id,
    ownerUserId: customerAUser.id,
    purchaseDate: new Date('2026-06-14T00:00:00.000Z'),
    durationMonths: 36,
    warrantyStatus: warranty_status.ACTIVE,
  });

  await upsertDemoProduct({
    productCode: 'PRD-2026-DASHCAM',
    warrantyCode: 'WM-2026-DASHAA',
    serialNumber: 'SN-DASHCAM-A-001',
    name: 'Toyota Genuine Dash Camera',
    category: product_category.ACCESSORY,
    brand: 'Toyota',
    model: 'DashCam Pro',
    manufactureYear: 2026,
    customerId: customerA.id,
    ownerUserId: customerAUser.id,
    purchaseDate: new Date('2025-01-01T00:00:00.000Z'),
    durationMonths: 12,
    warrantyStatus: warranty_status.EXPIRED,
  });

  const civicDemo = await upsertDemoProduct({
    productCode: 'PRD-2026-CIVIC',
    warrantyCode: 'WM-2026-CIVICB',
    serialNumber: 'VIN-CIVIC-B-2026',
    name: 'Honda Civic RS',
    category: product_category.CAR,
    brand: 'Honda',
    model: 'Civic',
    manufactureYear: 2026,
    customerId: customerB.id,
    ownerUserId: customerBUser.id,
    purchaseDate: new Date('2026-03-10T00:00:00.000Z'),
    durationMonths: 36,
    warrantyStatus: warranty_status.ACTIVE,
  });

  const walkInBatteryDemo = await upsertDemoProduct({
    productCode: 'PRD-2026-WALKIN-BATTERY',
    warrantyCode: 'WM-2026-WALKIN1',
    serialNumber: 'SN-WALKIN-BATTERY-001',
    name: 'Genuine Battery Pack',
    category: product_category.SPARE_PART,
    brand: 'Toyota',
    model: 'Battery Plus',
    manufactureYear: 2026,
    customerId: walkInCustomer.id,
    ownerUserId: null,
    purchaseDate: new Date('2026-07-01T00:00:00.000Z'),
    durationMonths: 24,
    warrantyStatus: warranty_status.ACTIVE,
  });

  const expiringSoonDemo = await upsertDemoProduct({
    productCode: 'PRD-2026-EXPIRING-7D',
    warrantyCode: 'WM-2026-EXP7D',
    serialNumber: 'SN-EXPIRING-7D-001',
    name: 'Lexzenz Parking Sensor Kit',
    category: product_category.ACCESSORY,
    brand: 'Lexzenz',
    model: 'ParkSense 360',
    manufactureYear: 2026,
    customerId: customerA.id,
    ownerUserId: customerAUser.id,
    purchaseDate: addDays(seedNow, -25),
    durationMonths: 1,
    warrantyStatus: warranty_status.ACTIVE,
  });

  const expiringMonthDemo = await upsertDemoProduct({
    productCode: 'PRD-2026-EXPIRING-30D',
    warrantyCode: 'WM-2026-EXP30D',
    serialNumber: 'SN-EXPIRING-30D-001',
    name: 'Lexzenz Tire Pressure Monitor',
    category: product_category.ACCESSORY,
    brand: 'Lexzenz',
    model: 'TPMS Pro',
    manufactureYear: 2026,
    customerId: customerB.id,
    ownerUserId: customerBUser.id,
    purchaseDate: addDays(seedNow, -5),
    durationMonths: 1,
    warrantyStatus: warranty_status.ACTIVE,
  });

  await upsertDemoProduct({
    productCode: 'PRD-2026-DRAFT-CAMERA',
    warrantyCode: 'WM-2026-DRAFT1',
    serialNumber: 'SN-DRAFT-CAMERA-001',
    name: 'Lexzenz Rear Camera Draft',
    category: product_category.ACCESSORY,
    brand: 'Lexzenz',
    model: 'RearCam Lite',
    manufactureYear: 2026,
    customerId: walkInCustomer.id,
    ownerUserId: null,
    purchaseDate: seedNow,
    durationMonths: 12,
    warrantyStatus: warranty_status.DRAFT,
  });

  await upsertDemoProduct({
    productCode: 'PRD-2026-VOIDED-GPS',
    warrantyCode: 'WM-2026-VOID1',
    serialNumber: 'SN-VOIDED-GPS-001',
    name: 'Lexzenz GPS Tracker Voided',
    category: product_category.ACCESSORY,
    brand: 'Lexzenz',
    model: 'TrackOne',
    manufactureYear: 2026,
    customerId: walkInCustomer.id,
    ownerUserId: null,
    purchaseDate: addDays(seedNow, -60),
    durationMonths: 12,
    warrantyStatus: warranty_status.VOIDED,
  });

  // Keep one record for every warranty status inside the recent date ranges
  // so the dashboard grouped trend chart can be verified after seeding.
  const chartDemoDate = addDays(seedNow, -10);

  await upsertDemoProduct({
    productCode: 'PRD-2026-CHART-DRAFT',
    warrantyCode: 'WM-2026-CHART-DRAFT',
    serialNumber: 'SN-CHART-DRAFT-001',
    name: 'Lexzenz Chart Demo Draft',
    category: product_category.ACCESSORY,
    brand: 'Lexzenz',
    model: 'Chart Draft',
    manufactureYear: 2026,
    customerId: customerA.id,
    ownerUserId: customerAUser.id,
    purchaseDate: chartDemoDate,
    durationMonths: 12,
    warrantyStatus: warranty_status.DRAFT,
  });

  await upsertDemoProduct({
    productCode: 'PRD-2026-CHART-ACTIVE',
    warrantyCode: 'WM-2026-CHART-ACTIVE',
    serialNumber: 'SN-CHART-ACTIVE-001',
    name: 'Lexzenz Chart Demo Active',
    category: product_category.ACCESSORY,
    brand: 'Lexzenz',
    model: 'Chart Active',
    manufactureYear: 2026,
    customerId: customerB.id,
    ownerUserId: customerBUser.id,
    purchaseDate: chartDemoDate,
    durationMonths: 12,
    warrantyStatus: warranty_status.ACTIVE,
  });

  await upsertDemoProduct({
    productCode: 'PRD-2026-CHART-EXPIRED',
    warrantyCode: 'WM-2026-CHART-EXPIRED',
    serialNumber: 'SN-CHART-EXPIRED-001',
    name: 'Lexzenz Chart Demo Expired',
    category: product_category.ACCESSORY,
    brand: 'Lexzenz',
    model: 'Chart Expired',
    manufactureYear: 2026,
    customerId: walkInCustomer.id,
    ownerUserId: null,
    purchaseDate: chartDemoDate,
    durationMonths: 1,
    warrantyStatus: warranty_status.EXPIRED,
  });

  await upsertDemoProduct({
    productCode: 'PRD-2026-CHART-VOIDED',
    warrantyCode: 'WM-2026-CHART-VOIDED',
    serialNumber: 'SN-CHART-VOIDED-001',
    name: 'Lexzenz Chart Demo Voided',
    category: product_category.ACCESSORY,
    brand: 'Lexzenz',
    model: 'Chart Voided',
    manufactureYear: 2026,
    customerId: customerA.id,
    ownerUserId: customerAUser.id,
    purchaseDate: chartDemoDate,
    durationMonths: 12,
    warrantyStatus: warranty_status.VOIDED,
  });

  // Add nearby dates with the same status set from a compact JSON fixture.
  for (const chartDate of dashboardWarrantyChartSeed) {
    for (const [statusIndex, statusName] of chartDate.statuses.entries()) {
      const status = warranty_status[statusName];
      const offset = chartDate.offsetDays;
      for (let copy = 1; copy <= chartDate.copies; copy += 1) {
        const statusKey = status.toLowerCase();
        const suffix = `${statusKey}-${offset}d-${statusIndex + 1}-${copy}`;

        await upsertDemoProduct({
          productCode: `PRD-2026-CHART-${suffix}`,
          warrantyCode: `WM-2026-CHART-${suffix}`,
          serialNumber: `SN-CHART-${suffix}`,
          name: `Lexzenz Chart ${statusKey} ${offset}d #${copy}`,
          category: product_category.ACCESSORY,
          brand: 'Lexzenz',
          model: `Chart ${statusKey}`,
          manufactureYear: 2026,
          customerId:
            status === warranty_status.VOIDED ? customerA.id : customerB.id,
          ownerUserId:
            status === warranty_status.VOIDED
              ? customerAUser.id
              : customerBUser.id,
          purchaseDate: addDays(seedNow, -offset),
          durationMonths: status === warranty_status.EXPIRED ? 1 : 12,
          warrantyStatus: status,
        });
      }
    }
  }

  const pendingActivationRequest = await upsertDemoWarrantyActivationRequest({
    requestCode: 'WAR-DEMO-PENDING',
    status: warranty_activation_request_status.PENDING,
    source: warranty_activation_request_source.PUBLIC_WEB,
    warrantyCode: 'WM-REQ-PENDING',
    customerName: 'Pham Thi Lan',
    customerPhone: '0900000101',
    customerEmail: 'lan.activation@example.com',
    categoryId: carCategory?.id,
    dealerId: lexzenzHanoiDealer.id,
    vehiclePlate: '30A-12345',
    vehicleModel: 'Toyota Corolla Cross',
    installedAt: addDays(seedNow, -1),
    warrantyDurationMonths: 36,
    productName: 'Toyota Corolla Cross',
    serialNumber: 'VIN-REQ-PENDING-001',
    brand: 'Toyota',
    model: 'Corolla Cross',
    manufactureYear: 2026,
    note: 'Customer submitted from public activation form.',
    createdAt: addDays(seedNow, -1),
  });

  await upsertDemoWarrantyActivationRequest({
    requestCode: 'WAR-DEMO-APPROVED',
    status: warranty_activation_request_status.APPROVED,
    source: warranty_activation_request_source.ADMIN_PORTAL,
    warrantyCode: 'WM-REQ-APPROVED',
    customerName: customerB.full_name,
    customerPhone: customerB.phone ?? '0900000002',
    customerEmail: customerB.email,
    customerId: customerB.id,
    categoryId: accessoryCategory?.id,
    productId: expiringMonthDemo.product.id,
    dealerId: lexzenzHcmDealer.id,
    vehiclePlate: '51F-67890',
    vehicleModel: 'Honda Civic RS',
    installedAt: addDays(seedNow, -8),
    warrantyDurationMonths: 12,
    productName: expiringMonthDemo.product.template.name,
    serialNumber: expiringMonthDemo.product.serial_number,
    brand: expiringMonthDemo.product.template.brand,
    model: expiringMonthDemo.product.template.model,
    manufactureYear: expiringMonthDemo.product.template.model_year,
    adminNote: 'Approved by demo admin, awaiting warranty activation.',
    createdById: adminUser.id,
    reviewedById: moderatorUser.id,
    reviewedAt: addDays(seedNow, -6),
    createdAt: addDays(seedNow, -7),
  });

  await upsertDemoWarrantyActivationRequest({
    requestCode: 'WAR-DEMO-REJECTED',
    status: warranty_activation_request_status.REJECTED,
    source: warranty_activation_request_source.PUBLIC_WEB,
    warrantyCode: 'WM-REQ-REJECTED',
    customerName: 'Do Van Khoa',
    customerPhone: '0900000103',
    customerEmail: 'khoa.activation@example.com',
    categoryId: sparePartCategory?.id,
    dealerId: lexzenzHanoiDealer.id,
    productName: 'Unknown Battery Pack',
    serialNumber: 'SN-REQ-REJECTED-001',
    brand: 'Unknown',
    model: 'Battery',
    manufactureYear: 2024,
    rejectionReason: 'Serial number does not match eligible product records.',
    reviewedById: moderatorUser.id,
    reviewedAt: addDays(seedNow, -4),
    createdAt: addDays(seedNow, -5),
  });

  await upsertDemoWarrantyActivationRequest({
    requestCode: 'WAR-DEMO-ACTIVATED',
    status: warranty_activation_request_status.ACTIVATED,
    source: warranty_activation_request_source.PUBLIC_WEB,
    warrantyCode: camryDemo.warranty.warranty_code,
    customerName: customerA.full_name,
    customerPhone: customerA.phone ?? '0900000001',
    customerEmail: customerA.email,
    customerId: customerA.id,
    categoryId: carCategory?.id,
    productId: camryDemo.product.id,
    dealerId: lexzenzHanoiDealer.id,
    vehiclePlate: '30G-24680',
    vehicleModel: camryDemo.product.template.name,
    installedAt: camryDemo.warranty.start_date,
    warrantyDurationMonths: camryDemo.warranty.duration_months,
    productName: camryDemo.product.template.name,
    serialNumber: camryDemo.product.serial_number,
    brand: camryDemo.product.template.brand,
    model: camryDemo.product.template.model,
    manufactureYear: camryDemo.product.template.model_year,
    reviewedById: adminUser.id,
    reviewedAt: addDays(seedNow, -2),
    activatedWarrantyId: camryDemo.warranty.id,
    createdAt: addDays(seedNow, -3),
  });

  await upsertDemoWarrantyActivationRequest({
    requestCode: 'WAR-DEMO-CANCELLED',
    status: warranty_activation_request_status.CANCELLED,
    source: warranty_activation_request_source.ADMIN_PORTAL,
    warrantyCode: 'WM-REQ-CANCELLED',
    customerName: walkInCustomer.full_name,
    customerPhone: walkInCustomer.phone ?? '0900000003',
    customerEmail: walkInCustomer.email,
    customerId: walkInCustomer.id,
    categoryId: accessoryCategory?.id,
    productId: expiringSoonDemo.product.id,
    dealerId: lexzenzHanoiDealer.id,
    productName: expiringSoonDemo.product.template.name,
    serialNumber: expiringSoonDemo.product.serial_number,
    brand: expiringSoonDemo.product.template.brand,
    model: expiringSoonDemo.product.template.model,
    manufactureYear: expiringSoonDemo.product.template.model_year,
    adminNote: 'Cancelled after customer created a replacement request.',
    createdById: adminUser.id,
    reviewedById: adminUser.id,
    reviewedAt: addDays(seedNow, -1),
    createdAt: addDays(seedNow, -2),
  });

  const activationRequestChartTargets = [
    {
      categoryId: carCategory?.id,
      customerId: customerA.id,
      customerName: customerA.full_name,
      customerPhone: customerA.phone ?? '0900000001',
      customerEmail: customerA.email,
      dealerId: lexzenzHanoiDealer.id,
      productId: camryDemo.product.id,
      productName: camryDemo.product.template.name,
      serialNumber: camryDemo.product.serial_number,
      brand: camryDemo.product.template.brand,
      model: camryDemo.product.template.model,
      manufactureYear: camryDemo.product.template.model_year,
    },
    {
      categoryId: accessoryCategory?.id,
      customerId: customerB.id,
      customerName: customerB.full_name,
      customerPhone: customerB.phone ?? '0900000002',
      customerEmail: customerB.email,
      dealerId: lexzenzHcmDealer.id,
      productId: expiringMonthDemo.product.id,
      productName: expiringMonthDemo.product.template.name,
      serialNumber: expiringMonthDemo.product.serial_number,
      brand: expiringMonthDemo.product.template.brand,
      model: expiringMonthDemo.product.template.model,
      manufactureYear: expiringMonthDemo.product.template.model_year,
    },
    {
      categoryId: accessoryCategory?.id,
      customerId: walkInCustomer.id,
      customerName: walkInCustomer.full_name,
      customerPhone: walkInCustomer.phone ?? '0900000003',
      customerEmail: walkInCustomer.email,
      dealerId: lexzenzHanoiDealer.id,
      productId: expiringSoonDemo.product.id,
      productName: expiringSoonDemo.product.template.name,
      serialNumber: expiringSoonDemo.product.serial_number,
      brand: expiringSoonDemo.product.template.brand,
      model: expiringSoonDemo.product.template.model,
      manufactureYear: expiringSoonDemo.product.template.model_year,
    },
  ];
  const activationRequestSources = [
    warranty_activation_request_source.PUBLIC_WEB,
    warranty_activation_request_source.ADMIN_PORTAL,
  ];

  for (const chartDate of dashboardActivationRequestChartSeed) {
    for (const [statusIndex, statusName] of chartDate.statuses.entries()) {
      const status = warranty_activation_request_status[statusName];
      const offset = chartDate.offsetDays;

      for (let copy = 1; copy <= chartDate.copies; copy += 1) {
        const target =
          activationRequestChartTargets[
            (offset + statusIndex + copy) % activationRequestChartTargets.length
          ];
        const createdAt = addDays(seedNow, -offset);
        const statusKey = status.toLowerCase();
        const suffix = `${statusKey}-${offset}d-${statusIndex + 1}-${copy}`;

        await upsertDemoWarrantyActivationRequest({
          requestCode: `WAR-CHART-${suffix}`,
          status,
          source:
            activationRequestSources[
              (offset + statusIndex + copy) % activationRequestSources.length
            ],
          warrantyCode: `WM-ACT-CHART-${suffix}`,
          customerName: target.customerName,
          customerPhone: target.customerPhone,
          customerEmail: target.customerEmail,
          customerId: target.customerId,
          categoryId: target.categoryId,
          productId: null,
          dealerId: target.dealerId,
          installedAt: createdAt,
          warrantyDurationMonths: 12,
          productName: target.productName,
          serialNumber: `SN-ACT-CHART-${suffix}`,
          brand: target.brand,
          model: target.model,
          manufactureYear: target.manufactureYear,
          note: 'Synthetic dashboard data for activation request status chart.',
          createdById:
            status === warranty_activation_request_status.PENDING
              ? null
              : adminUser.id,
          reviewedById:
            status === warranty_activation_request_status.PENDING
              ? null
              : moderatorUser.id,
          reviewedAt:
            status === warranty_activation_request_status.PENDING
              ? null
              : createdAt,
          rejectionReason:
            status === warranty_activation_request_status.REJECTED
              ? 'Demo rejection reason for dashboard chart.'
              : null,
          createdAt,
        });
      }
    }
  }

  const submittedClaimAt = seedNow;
  const reviewingClaimAt = addDays(seedNow, -3);
  const repairClaimAt = addDays(seedNow, -10);

  const submittedClaim = await upsertDemoWarrantyClaim({
    claimCode: 'CLM-DEMO-SUBMITTED',
    warrantyId: camryDemo.warranty.id,
    productId: camryDemo.product.id,
    customerId: customerA.id,
    serviceCenterId: null,
    warrantyCode: camryDemo.warranty.warranty_code,
    requesterName: customerA.full_name,
    requesterPhone: customerA.phone ?? '0900000001',
    issueTitle: 'Abnormal engine warning light',
    issueDetail:
      'The engine warning light appeared after startup. The vehicle still operates normally.',
    status: warranty_claim_status.SUBMITTED,
    priority: warranty_claim_priority.NORMAL,
    dueAt: addDays(seedNow, 2),
    submittedAt: submittedClaimAt,
    history: [
      {
        fromStatus: null,
        toStatus: warranty_claim_status.SUBMITTED,
        note: 'Demo claim submitted by customer.',
        changedByUserId: adminUser.id,
        createdAt: submittedClaimAt,
      },
    ],
  });

  await upsertDemoWarrantyClaim({
    claimCode: 'CLM-DEMO-REVIEWING',
    warrantyId: civicDemo.warranty.id,
    productId: civicDemo.product.id,
    customerId: customerB.id,
    serviceCenterId: hcmServiceCenter.id,
    warrantyCode: civicDemo.warranty.warranty_code,
    requesterName: customerB.full_name,
    requesterPhone: customerB.phone ?? '0900000002',
    issueTitle: 'Air conditioning cooling performance decreased',
    issueDetail:
      'The cabin takes longer than usual to cool down during daytime driving.',
    status: warranty_claim_status.REVIEWING,
    priority: warranty_claim_priority.HIGH,
    dueAt: addDays(seedNow, 1),
    submittedAt: reviewingClaimAt,
    history: [
      {
        fromStatus: null,
        toStatus: warranty_claim_status.SUBMITTED,
        note: 'Claim received through the service hotline.',
        changedByUserId: adminUser.id,
        createdAt: reviewingClaimAt,
      },
      {
        fromStatus: warranty_claim_status.SUBMITTED,
        toStatus: warranty_claim_status.REVIEWING,
        note: 'Assigned to the Ho Chi Minh service center for review.',
        changedByUserId: moderatorUser.id,
        createdAt: addDays(reviewingClaimAt, 1),
      },
    ],
  });

  await upsertDemoWarrantyClaim({
    claimCode: 'CLM-DEMO-IN-REPAIR',
    warrantyId: walkInBatteryDemo.warranty.id,
    productId: walkInBatteryDemo.product.id,
    customerId: walkInCustomer.id,
    serviceCenterId: danangServiceCenter.id,
    warrantyCode: walkInBatteryDemo.warranty.warranty_code,
    requesterName: walkInCustomer.full_name,
    requesterPhone: walkInCustomer.phone ?? '0900000003',
    issueTitle: 'Battery cannot retain charge',
    issueDetail:
      'The battery loses charge overnight and requires inspection or replacement.',
    status: warranty_claim_status.IN_REPAIR,
    priority: warranty_claim_priority.URGENT,
    dueAt: addDays(seedNow, -1),
    slaBreachedAt: addDays(seedNow, -1),
    submittedAt: repairClaimAt,
    history: [
      {
        fromStatus: null,
        toStatus: warranty_claim_status.SUBMITTED,
        note: 'Walk-in claim received at the Da Nang service center.',
        changedByUserId: adminUser.id,
        createdAt: repairClaimAt,
      },
      {
        fromStatus: warranty_claim_status.SUBMITTED,
        toStatus: warranty_claim_status.REVIEWING,
        note: 'Warranty eligibility verified.',
        changedByUserId: moderatorUser.id,
        createdAt: addDays(repairClaimAt, 1),
      },
      {
        fromStatus: warranty_claim_status.REVIEWING,
        toStatus: warranty_claim_status.APPROVED,
        note: 'Battery inspection approved under warranty.',
        changedByUserId: moderatorUser.id,
        createdAt: addDays(repairClaimAt, 2),
      },
      {
        fromStatus: warranty_claim_status.APPROVED,
        toStatus: warranty_claim_status.IN_REPAIR,
        note: 'Replacement battery ordered and repair started.',
        changedByUserId: moderatorUser.id,
        createdAt: addDays(repairClaimAt, 3),
      },
    ],
  });

  const recentNotificationAt = new Date(seedNow.getTime() - 30 * 60 * 1000);
  const readNotificationAt = new Date(seedNow.getTime() - 24 * 60 * 60 * 1000);

  await upsertDemoNotification({
    id: '00000000-0000-4000-8000-000000000305',
    title: `New warranty claim ${submittedClaim.claim_code}`,
    content: `Warranty claim ${submittedClaim.claim_code} has been submitted.`,
    type: NOTIFICATION_TYPES.WARRANTY_CLAIM_CREATED,
    source: notification_source.SYSTEM,
    scope: notification_scope.ROLE,
    deliveryStatus: notification_delivery_status.SENT,
    sentAt: new Date(seedNow.getTime() - 10 * 60 * 1000),
    metadata: {
      claimId: submittedClaim.id,
      claimCode: submittedClaim.claim_code,
      warrantyCode: submittedClaim.warranty_code,
      status: submittedClaim.status,
    },
    recipients: [
      {
        userId: adminUser.id,
        status: notification_read_status.UNREAD,
      },
      {
        userId: moderatorUser.id,
        status: notification_read_status.UNREAD,
      },
    ],
  });

  await upsertDemoNotification({
    id: '00000000-0000-4000-8000-000000000306',
    title: `New warranty activation request ${pendingActivationRequest.request_code}`,
    content: `Warranty activation request ${pendingActivationRequest.request_code} has been submitted.`,
    type: NOTIFICATION_TYPES.WARRANTY_ACTIVATION_REQUEST_CREATED,
    source: notification_source.SYSTEM,
    scope: notification_scope.ROLE,
    deliveryStatus: notification_delivery_status.SENT,
    sentAt: new Date(seedNow.getTime() - 20 * 60 * 1000),
    metadata: {
      requestId: pendingActivationRequest.id,
      requestCode: pendingActivationRequest.request_code,
      warrantyCode: pendingActivationRequest.warranty_code,
      customerName: pendingActivationRequest.customer_name,
      customerPhone: pendingActivationRequest.customer_phone,
      source: pendingActivationRequest.source,
      status: pendingActivationRequest.status,
    },
    recipients: [
      {
        userId: adminUser.id,
        status: notification_read_status.UNREAD,
      },
      {
        userId: moderatorUser.id,
        status: notification_read_status.UNREAD,
      },
    ],
  });

  await upsertDemoNotification({
    id: '00000000-0000-4000-8000-000000000301',
    title: 'New warranty claim assigned',
    content:
      'Claim CLM-DEMO-IN-REPAIR requires coordination with the assigned service center.',
    type: 'WARRANTY_CLAIM_ASSIGNED',
    source: notification_source.SYSTEM,
    scope: notification_scope.ROLE,
    deliveryStatus: notification_delivery_status.SENT,
    sentAt: recentNotificationAt,
    metadata: { claimCode: 'CLM-DEMO-IN-REPAIR' },
    recipients: [
      {
        userId: adminUser.id,
        status: notification_read_status.UNREAD,
      },
      {
        userId: moderatorUser.id,
        status: notification_read_status.UNREAD,
      },
    ],
  });

  await upsertDemoNotification({
    id: '00000000-0000-4000-8000-000000000302',
    title: 'Warranty claim SLA breached',
    content:
      'Claim CLM-DEMO-IN-REPAIR has passed its expected handling deadline.',
    type: NOTIFICATION_TYPES.WARRANTY_CLAIM_SLA_BREACHED,
    source: notification_source.SYSTEM,
    scope: notification_scope.ROLE,
    deliveryStatus: notification_delivery_status.SENT,
    sentAt: new Date(seedNow.getTime() - 60 * 60 * 1000),
    metadata: { claimCode: 'CLM-DEMO-IN-REPAIR' },
    recipients: [
      {
        userId: adminUser.id,
        status: notification_read_status.UNREAD,
      },
      {
        userId: moderatorUser.id,
        status: notification_read_status.UNREAD,
      },
    ],
  });

  await upsertDemoNotification({
    id: '00000000-0000-4000-8000-000000000303',
    title: 'Service center assignment updated',
    content: 'The demo repair claim was reassigned to Hanoi Warranty Center.',
    type: 'SERVICE_CENTER_ASSIGNMENT_UPDATED',
    source: notification_source.ADMIN,
    scope: notification_scope.USER,
    deliveryStatus: notification_delivery_status.SENT,
    createdById: adminUser.id,
    sentAt: readNotificationAt,
    metadata: { claimCode: 'CLM-DEMO-IN-REPAIR' },
    recipients: [
      {
        userId: adminUser.id,
        status: notification_read_status.READ,
        readAt: readNotificationAt,
      },
    ],
  });

  await upsertDemoNotification({
    id: '00000000-0000-4000-8000-000000000304',
    title: 'Scheduled maintenance notice',
    content:
      'The warranty management system will undergo scheduled maintenance.',
    type: 'SYSTEM_MAINTENANCE',
    source: notification_source.ADMIN,
    scope: notification_scope.ALL,
    deliveryStatus: notification_delivery_status.SCHEDULED,
    createdById: adminUser.id,
    scheduledAt: addDays(seedNow, 1),
  });

  console.log('Base database seed completed successfully.');
  console.log(`Admin: ${adminUser.email} (${adminUser.role})`);
  console.log(`Moderator: ${moderatorUser.email} (${moderatorUser.role})`);
  console.log(`Customer A: ${customerAUser.email} (${customerAUser.role})`);
  console.log(`Customer B: ${customerBUser.email} (${customerBUser.role})`);
  console.log(
    `Walk-in customer: ${walkInCustomer.customer_code} (no login account)`,
  );
  console.log('Customer A codes: WM-2026-CAMRYA, WM-2026-DASHAA');
  console.log('Customer B code: WM-2026-CIVICB');
  console.log('Walk-in customer code: WM-2026-WALKIN1');
  console.log(
    `Service centers: ${hanoiServiceCenter.name}, ${hcmServiceCenter.name}, ${danangServiceCenter.name}`,
  );
  console.log(
    'Warranty claims: CLM-DEMO-SUBMITTED, CLM-DEMO-REVIEWING, CLM-DEMO-IN-REPAIR',
  );
  console.log('Notifications: 5 sent demo messages and 1 scheduled message');
  console.log('Default password: password123');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
