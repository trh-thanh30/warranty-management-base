import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { seedLexzenzProductCategories } from './seed-categories';
import { seedContentPages } from './seed-content-pages';
import { seedLexzenzDealers } from './seed-dealers';
import { seedLexzenzProducts } from './seed-products';
import { seedProductionUsers } from './seed-production-users';
import { seedWebsiteSiteSettings } from './seed-website-config';

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

  const { admin, moderator } = await seedProductionUsers(prisma);
  console.log(`Seeded production admin: ${admin.email}`);
  console.log(`Seeded production moderator: ${moderator.email}`);
  await seedLexzenzProductCategories(prisma);
  await seedLexzenzProducts(prisma);
  await seedLexzenzDealers(prisma);
  await seedContentPages(prisma);
  await seedWebsiteSiteSettings(prisma);

  console.log('Production database seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Error seeding production database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
