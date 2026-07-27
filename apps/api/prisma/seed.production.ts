import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, user_role, user_status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { seedLexzenzProductCategories } from './seed-categories';
import { seedPolicyContentPages } from './seed-content-pages';
import { seedWebsiteConfigDrafts } from './seed-website-config';

let prisma: PrismaClient | undefined;

async function main() {
  console.log('Seeding production database...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  await seedProductionAdmin(prisma);
  await seedLexzenzProductCategories(prisma);
  await seedPolicyContentPages(prisma);
  await seedWebsiteConfigDrafts(prisma);

  console.log('Production database seed completed successfully.');
}

async function seedProductionAdmin(client: PrismaClient) {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const username = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'password123';
  const hashedPassword = await bcrypt.hash(password, 12);

  const [userByEmail, userByUsername] = await Promise.all([
    client.user.findUnique({ where: { email } }),
    client.user.findUnique({ where: { username } }),
  ]);

  if (userByEmail && userByUsername && userByEmail.id !== userByUsername.id) {
    throw new Error(
      `Cannot seed production admin ${email}/${username}: email and username belong to different users.`,
    );
  }

  const existingUser = userByEmail ?? userByUsername;
  const data = {
    email,
    is_verified: true,
    password: hashedPassword,
    role: user_role.ADMIN,
    status: user_status.ACTIVE,
    username,
  };

  const admin = existingUser
    ? await client.user.update({
        where: { id: existingUser.id },
        data,
      })
    : await client.user.create({ data });

  console.log(`Seeded production admin: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error('Error seeding production database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
