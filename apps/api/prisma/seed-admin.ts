import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, user_role, user_status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

type SeedUserInput = {
  email: string;
  password: string;
  username: string;
  role: user_role;
  status: user_status;
  is_verified: boolean;
};

export type SeedAdminUsersResult = {
  adminUser: Awaited<ReturnType<PrismaClient['user']['create']>>;
  moderatorUser: Awaited<ReturnType<PrismaClient['user']['create']>>;
  customerAUser: Awaited<ReturnType<PrismaClient['user']['create']>>;
  customerBUser: Awaited<ReturnType<PrismaClient['user']['create']>>;
};

async function upsertSeedUser(prisma: PrismaClient, data: SeedUserInput) {
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

export async function seedAdminUsers(
  prisma: PrismaClient,
): Promise<SeedAdminUsersResult> {
  const hashedPassword = await bcrypt.hash('password123', 12);

  const adminUser = await upsertSeedUser(prisma, {
    email: 'admin@example.com',
    password: hashedPassword,
    username: 'admin',
    role: user_role.ADMIN,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const moderatorUser = await upsertSeedUser(prisma, {
    email: 'moderator@example.com',
    password: hashedPassword,
    username: 'moderator',
    role: user_role.MODERATOR,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const customerAUser = await upsertSeedUser(prisma, {
    email: 'customer.a@example.com',
    password: hashedPassword,
    username: 'customer-a',
    role: user_role.CUSTOMER,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const customerBUser = await upsertSeedUser(prisma, {
    email: 'customer.b@example.com',
    password: hashedPassword,
    username: 'customer-b',
    role: user_role.CUSTOMER,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  return {
    adminUser,
    customerAUser,
    customerBUser,
    moderatorUser,
  };
}

let prisma: PrismaClient | undefined;

async function main() {
  console.log('Seeding admin and demo login users...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  const result = await seedAdminUsers(prisma);

  console.log('Admin and demo login users seeded successfully.');
  console.log(`Admin: ${result.adminUser.email} (${result.adminUser.role})`);
  console.log(
    `Moderator: ${result.moderatorUser.email} (${result.moderatorUser.role})`,
  );
  console.log(
    `Customer A: ${result.customerAUser.email} (${result.customerAUser.role})`,
  );
  console.log(
    `Customer B: ${result.customerBUser.email} (${result.customerBUser.role})`,
  );
  console.log('Default password: password123');
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Error seeding admin users:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma?.$disconnect();
    });
}
