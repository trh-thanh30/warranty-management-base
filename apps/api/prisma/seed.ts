import { PrismaPg } from '@prisma/adapter-pg';
import {
  category_type,
  PrismaClient,
  product_category,
  product_status,
  user_role,
  user_status,
  warranty_status,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

let prisma: PrismaClient;

type SeedUserInput = {
  email: string;
  password: string;
  username: string;
  role: user_role;
  status: user_status;
  is_verified: boolean;
};

async function upsertSeedUser(data: SeedUserInput) {
  const [userByEmail, userByUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email: data.email } }),
    prisma.user.findUnique({ where: { username: data.username } }),
  ]);

  if (userByEmail && userByUsername && userByEmail.id !== userByUsername.id) {
    throw new Error(
      `Cannot seed user ${data.email}/${data.username}: email and username belong to different existing users.`,
    );
  }

  const existingUser = userByEmail ?? userByUsername;

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data,
    });
  }

  return prisma.user.create({ data });
}

async function upsertCustomer(data: {
  userId: string;
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
  ownerUserId: string;
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

  await prisma.warranty.upsert({
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
      owner_user_id: data.ownerUserId,
      purchase_date: data.purchaseDate,
      activated_at: data.purchaseDate,
      is_current_owner: true,
    },
  });

  return product;
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

  const hashedPassword = await bcrypt.hash('password123', 12);

  await seedDefaultCategories();

  const adminUser = await upsertSeedUser({
    email: 'admin@example.com',
    password: hashedPassword,
    username: 'admin',
    role: user_role.ADMIN,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const moderatorUser = await upsertSeedUser({
    email: 'moderator@example.com',
    password: hashedPassword,
    username: 'moderator',
    role: user_role.MODERATOR,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const customerAUser = await upsertSeedUser({
    email: 'customer.a@example.com',
    password: hashedPassword,
    username: 'customer-a',
    role: user_role.CUSTOMER,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const customerBUser = await upsertSeedUser({
    email: 'customer.b@example.com',
    password: hashedPassword,
    username: 'customer-b',
    role: user_role.CUSTOMER,
    status: user_status.ACTIVE,
    is_verified: true,
  });

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

  await upsertDemoProduct({
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

  await upsertDemoProduct({
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

  console.log('Base database seed completed successfully.');
  console.log(`Admin: ${adminUser.email} (${adminUser.role})`);
  console.log(`Moderator: ${moderatorUser.email} (${moderatorUser.role})`);
  console.log(`Customer A: ${customerAUser.email} (${customerAUser.role})`);
  console.log(`Customer B: ${customerBUser.email} (${customerBUser.role})`);
  console.log('Customer A codes: WM-2026-CAMRYA, WM-2026-DASHAA');
  console.log('Customer B code: WM-2026-CIVICB');
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
