import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

export const lexzenzDealers = [
  {
    name: 'Ngọc Thuý Auto',
    phone: '0589994888',
    address:
      '245 Trần Quang Khải, Phường Thọ Xương, Thành phố Bắc Giang, Bắc Giang',
    province: 'Tỉnh Bắc Ninh',
    district: 'Phường Thọ Xương',
    latitude: 21.292093,
    longitude: 106.196323,
    metadata: {
      coordinateAccuracy: 'approximate-street',
      coordinateProvider: 'Geoapify',
      sourcePostId: 283,
      sourceUrl: 'https://lexzenz.com/he-thong-dai-ly/ngoc-thuy-auto/',
    },
  },
  {
    name: 'Công Thắng Auto',
    phone: '0367406999',
    address:
      '353-355 Minh Khai, Phường Dĩnh Kế, Thành phố Bắc Giang, Bắc Giang',
    province: 'Tỉnh Bắc Ninh',
    district: 'Phường Dĩnh Kế',
    latitude: 21.28006,
    longitude: 106.210146,
    metadata: {
      coordinateAccuracy: 'approximate-street',
      coordinateProvider: 'Geoapify',
      sourcePostId: 284,
      sourceUrl: 'https://lexzenz.com/he-thong-dai-ly/cong-thang-auto/',
    },
  },
  {
    name: 'Hiền Hồng Auto',
    phone: '0973354798',
    address: 'An Long, Xã Yên Mỹ, Huyện Lạng Giang, Bắc Giang',
    province: 'Tỉnh Bắc Ninh',
    district: 'Xã Yên Mỹ',
    latitude: 21.3630614,
    longitude: 106.2664563,
    metadata: {
      coordinateAccuracy: 'approximate-ward',
      coordinateProvider: 'Geoapify',
      sourcePostId: 285,
      sourceUrl: 'https://lexzenz.com/he-thong-dai-ly/hien-hong-auto/',
    },
  },
  {
    name: 'Minh Hiếu Auto',
    phone: '0988522113',
    address:
      'Lô 76-77 Nguyễn Thế Nho, Thị trấn Bích Động, Huyện Việt Yên, Bắc Giang',
    province: 'Tỉnh Bắc Ninh',
    district: 'Thị trấn Bích Động',
    latitude: 21.27726,
    longitude: 106.113518,
    metadata: {
      coordinateAccuracy: 'street',
      coordinateProvider: 'Geoapify',
      sourceAddress:
        '7677 Nguyễn Thế Nho, Thị trấn Bích Động, Huyện Việt Yên, Bắc Giang',
      sourcePostId: 282,
      sourceUrl: 'https://lexzenz.com/he-thong-dai-ly/minh-hieu-auto/',
    },
  },
  {
    name: 'Minh Cốp Auto',
    phone: '0916269988',
    address:
      'Số 59, Tổ 15, Phường Tân Quang, Thành phố Tuyên Quang, Tuyên Quang',
    province: 'Tỉnh Tuyên Quang',
    district: 'Phường Tân Quang',
    latitude: 21.8163227,
    longitude: 105.2131635,
    metadata: {
      coordinateAccuracy: 'approximate-street',
      coordinateProvider: 'Geoapify',
      sourcePostId: 277,
      sourceUrl: 'https://lexzenz.com/he-thong-dai-ly/minh-cop-auto/',
    },
  },
] satisfies Array<{
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  metadata: Prisma.InputJsonObject;
  name: string;
  phone: string;
  province: string;
}>;

export async function seedLexzenzDealers(client: PrismaClient) {
  for (const dealer of lexzenzDealers) {
    await client.dealer.upsert({
      where: { phone: dealer.phone },
      update: {
        address: dealer.address,
        district: dealer.district,
        is_active: true,
        latitude: dealer.latitude,
        longitude: dealer.longitude,
        metadata: dealer.metadata,
        name: dealer.name,
        province: dealer.province,
      },
      create: {
        address: dealer.address,
        district: dealer.district,
        is_active: true,
        latitude: dealer.latitude,
        longitude: dealer.longitude,
        metadata: dealer.metadata,
        name: dealer.name,
        phone: dealer.phone,
        province: dealer.province,
      },
    });
  }

  console.log(`Seeded ${lexzenzDealers.length} Lexzenz dealers.`);
}

let prisma: PrismaClient | undefined;

async function main() {
  console.log('Seeding Lexzenz dealers...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  await seedLexzenzDealers(prisma);
  console.log('Lexzenz dealer seed completed successfully.');
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Error seeding Lexzenz dealers:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma?.$disconnect();
    });
}
