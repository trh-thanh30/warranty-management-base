import { PrismaPg } from '@prisma/adapter-pg';
import { category_type, Prisma, PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

let prisma: PrismaClient | undefined;

export const lexzenzProductCategories = [
  {
    code: 'LEXZENZ_REFLEX_KOREA_FILM',
    slug: 'lexzenz-reflex-korea-film',
    name: 'Film cách nhiệt ô tô Lexzenz Reflex Korea Film',
    description:
      'Nhóm sản phẩm film cách nhiệt ô tô Lexzenz Reflex Korea Film.',
    order: 10,
    metadata: {
      brand: 'Lexzenz',
      segment: 'automotive-window-film',
    },
  },
  {
    code: 'LEXZENZ_LED_FUJITEK',
    slug: 'lexzenz-led-fujitek',
    name: 'Đèn tăng sáng ô tô, xe máy Lexzenz Led Fujitek',
    description:
      'Nhóm sản phẩm đèn tăng sáng ô tô, xe máy Lexzenz Led Fujitek.',
    order: 20,
    metadata: {
      brand: 'Lexzenz',
      segment: 'automotive-lighting',
    },
  },
  {
    code: 'LEXZENZ_DASHCAM',
    slug: 'lexzenz-dashcam',
    name: 'Camera hành trình Lexzenz Dashcam',
    description: 'Nhóm sản phẩm camera hành trình Lexzenz Dashcam.',
    order: 30,
    metadata: {
      brand: 'Lexzenz',
      segment: 'dashcam',
    },
  },
  {
    code: 'LEXZENZ_TPMS',
    slug: 'lexzenz-tpms',
    name: 'Cảm biến Áp suất lốp TPMS Lexzenz',
    description: 'Nhóm sản phẩm cảm biến áp suất lốp TPMS Lexzenz.',
    order: 40,
    metadata: {
      brand: 'Lexzenz',
      segment: 'tpms',
    },
  },
] satisfies Array<{
  code: string;
  description: string;
  metadata: Prisma.InputJsonObject;
  name: string;
  order: number;
  slug: string;
}>;

export async function seedLexzenzProductCategories(client: PrismaClient) {
  for (const category of lexzenzProductCategories) {
    await client.category.upsert({
      where: {
        type_slug: {
          slug: category.slug,
          type: category_type.PRODUCT,
        },
      },
      update: {
        code: category.code,
        description: category.description,
        is_active: true,
        metadata: category.metadata,
        name: category.name,
        order: category.order,
      },
      create: {
        code: category.code,
        description: category.description,
        is_active: true,
        metadata: category.metadata,
        name: category.name,
        order: category.order,
        slug: category.slug,
        type: category_type.PRODUCT,
      },
    });
  }

  console.log(
    `Seeded ${lexzenzProductCategories.length} Lexzenz product categories.`,
  );
}

async function main() {
  console.log('Seeding Lexzenz product categories...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  await seedLexzenzProductCategories(prisma);
  console.log('Lexzenz product category seed completed successfully.');
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Error seeding Lexzenz product categories:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma?.$disconnect();
    });
}
