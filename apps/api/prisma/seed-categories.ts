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
      'Công nghệ phim cách nhiệt Phún Xạ Đa Lớp (Multilayer Sputter) & Ultra Nano Ceramic nhập khẩu từ Hàn Quốc, cản 99% tia UV/IR, cản nhiệt vượt trội.',
    imageUrl: '/product/product_1.jpg',
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
      'Hệ thống Bi LED, LED gầm, trợ sáng Offroad bám đường vượt trội, đường cắt ánh sáng gom tụ sắc nét không gây chói mắt xe ngược chiều.',
    imageUrl: '/product/product_3.jpg',
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
    description:
      'Camera ghi hình 4K sắc nét, quay đêm rõ nét, tích hợp cảnh báo biển báo giao thông bằng giọng nói & kết nối Wi-Fi app di động.',
    imageUrl: '/product/product_9.jpg',
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
    description:
      'Cảm biến đo áp suất & nhiệt độ lốp theo thời gian thực, hiển thị trực tiếp màn hình Android hoặc đồng hồ zin, đảm bảo an toàn tuyệt đối.',
    imageUrl: '/product/product_10.jpg',
    order: 40,
    metadata: {
      brand: 'Lexzenz',
      segment: 'tpms',
    },
  },
] satisfies Array<{
  code: string;
  description: string;
  imageUrl: string;
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
        image_url: category.imageUrl,
        is_active: true,
        metadata: category.metadata,
        name: category.name,
        order: category.order,
      },
      create: {
        code: category.code,
        description: category.description,
        image_url: category.imageUrl,
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
