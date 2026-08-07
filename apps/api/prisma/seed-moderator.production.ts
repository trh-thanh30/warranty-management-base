import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { seedProductionModerator } from './seed-production-users';

let prisma: PrismaClient | undefined;

async function main() {
  console.log('Seeding production moderator...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  const moderator = await seedProductionModerator(prisma);
  console.log(`Seeded production moderator: ${moderator.email}`);
}

main()
  .catch((error) => {
    console.error('Error seeding production moderator:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
