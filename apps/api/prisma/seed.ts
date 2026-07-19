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
  warranty_claim_priority,
  warranty_claim_status,
  warranty_status,
} from '@prisma/client';
import { Pool } from 'pg';
import { seedAdminUsers } from './seed-admin';

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

  const product = await prisma.product.upsert({
    where: { warranty_code: data.warrantyCode },
    update: {
      product_code: data.productCode,
      serial_number: data.serialNumber,
      name: data.name,
      category: data.category,
      brand: data.brand,
      model: data.model,
      manufacture_year: data.manufactureYear,
      status: product_status.ACTIVE,
      category_id: category?.id,
      deleted_at: null,
    },
    create: {
      product_code: data.productCode,
      warranty_code: data.warrantyCode,
      serial_number: data.serialNumber,
      name: data.name,
      category: data.category,
      brand: data.brand,
      model: data.model,
      manufacture_year: data.manufactureYear,
      status: product_status.ACTIVE,
      category_id: category?.id,
    },
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

  return { product, warranty };
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

  const seedNow = new Date();
  const submittedClaimAt = seedNow;
  const reviewingClaimAt = addDays(seedNow, -3);
  const repairClaimAt = addDays(seedNow, -10);

  await upsertDemoWarrantyClaim({
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
    type: 'WARRANTY_CLAIM_SLA_BREACHED',
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
  console.log('Notifications: 3 sent demo messages and 1 scheduled message');
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
