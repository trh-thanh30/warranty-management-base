import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, user_role, user_status } from '@prisma/client';
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

  const adminUser = await upsertSeedUser({
    email: 'admin@example.com',
    password: hashedPassword,
    username: 'admin',
    role: user_role.ADMIN,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const staffUser = await upsertSeedUser({
    email: 'staff@example.com',
    password: hashedPassword,
    username: 'staff',
    role: user_role.STAFF,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const regularUser = await upsertSeedUser({
    email: 'user@example.com',
    password: hashedPassword,
    username: 'user',
    role: user_role.USER,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  console.log('Base database seed completed successfully.');
  console.log(`Admin: ${adminUser.email} (${adminUser.role})`);
  console.log(`Staff: ${staffUser.email} (${staffUser.role})`);
  console.log(`User: ${regularUser.email} (${regularUser.role})`);
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
