import { PrismaPg } from '@prisma/adapter-pg';
import {
  category_type,
  Prisma,
  PrismaClient,
  product_status,
  warranty_status,
} from '@prisma/client';
import { Pool } from 'pg';

type LexzenzProductSeed = {
  brand: string;
  categoryCode: string;
  description: string;
  model: string;
  name: string;
  sku: string;
  slug: string;
  specifications: Array<{ key: string; value: string }>;
  warrantyDurationMonths: number;
};

export type LexzenzProductSeedClient = {
  category: {
    findMany(
      args: Prisma.CategoryFindManyArgs,
    ): PromiseLike<Array<{ code: string | null; id: string }>>;
  };
  product: {
    upsert(args: Prisma.ProductUpsertArgs): PromiseLike<{ id: string }>;
  };
  warranty: {
    upsert(args: Prisma.WarrantyUpsertArgs): PromiseLike<{ id: string }>;
  };
};

const FILM_CATEGORY = 'LEXZENZ_REFLEX_KOREA_FILM';
const LIGHTING_CATEGORY = 'LEXZENZ_LED_FUJITEK';
const DASHCAM_CATEGORY = 'LEXZENZ_DASHCAM';
const TPMS_CATEGORY = 'LEXZENZ_TPMS';

const categoryDetailMetadata = {
  [FILM_CATEGORY]: {
    features: [
      'Hỗ trợ cản tia hồng ngoại và tia cực tím.',
      'Duy trì tầm nhìn ổn định trong nhiều điều kiện ánh sáng.',
      'Nhiều mã phim phù hợp từng vị trí kính.',
    ],
    applications: [
      'Kính lái ô tô.',
      'Kính sườn và kính hậu.',
      'Xe cá nhân và xe dịch vụ.',
    ],
  },
  [LIGHTING_CATEGORY]: {
    features: [
      'Nguồn sáng hiệu suất cao.',
      'Thiết kế phù hợp với hệ thống điện ô tô.',
      'Hỗ trợ cải thiện tầm quan sát khi di chuyển ban đêm.',
    ],
    applications: [
      'Nâng cấp đèn pha và đèn gầm.',
      'Xe thường xuyên di chuyển ban đêm.',
      'Điều kiện đường thiếu sáng hoặc thời tiết xấu.',
    ],
  },
  [DASHCAM_CATEGORY]: {
    features: [
      'Ghi hình hành trình rõ nét.',
      'Hỗ trợ lưu lại bằng chứng khi xảy ra sự cố.',
      'Kết nối thuận tiện với điện thoại trên các phiên bản hỗ trợ.',
    ],
    applications: [
      'Xe cá nhân và xe gia đình.',
      'Xe dịch vụ và xe doanh nghiệp.',
      'Giám sát hành trình và khu vực đỗ xe.',
    ],
  },
  [TPMS_CATEGORY]: {
    features: [
      'Theo dõi áp suất và nhiệt độ lốp theo thời gian thực.',
      'Cảnh báo sớm khi thông số lốp bất thường.',
      'Hỗ trợ nâng cao an toàn và tuổi thọ lốp.',
    ],
    applications: [
      'Ô tô cá nhân.',
      'Xe bán tải và xe nhiều bánh trên phiên bản phù hợp.',
      'Xe máy và mô tô trên phiên bản chuyên dụng.',
    ],
  },
} satisfies Record<
  string,
  {
    applications: string[];
    features: string[];
  }
>;

export const lexzenzProductSeeds = [
  {
    sku: 'LEX-SP50',
    slug: 'phim-cach-nhiet-multilayer-sputter-sp50',
    name: 'Phim cách nhiệt Multilayer Sputter SP50',
    categoryCode: FILM_CATEGORY,
    brand: 'Lexzenz',
    model: 'SP50',
    description:
      'Phim cách nhiệt đa lớp dành cho kính lái, cân bằng độ xuyên sáng và khả năng cản nhiệt.',
    warrantyDurationMonths: 180,
    specifications: [
      { key: 'IR Block', value: '97%' },
      { key: 'UV Block', value: '99.9%' },
      { key: 'VLT', value: '50.6%' },
    ],
  },
  {
    sku: 'LEX-SP10',
    slug: 'phim-cach-nhiet-multilayer-sputter-sp10',
    name: 'Phim cách nhiệt Multilayer Sputter SP10',
    categoryCode: FILM_CATEGORY,
    brand: 'Lexzenz',
    model: 'SP10',
    description:
      'Phim cách nhiệt đa lớp màu tối dành cho kính sườn và kính hậu ô tô.',
    warrantyDurationMonths: 180,
    specifications: [
      { key: 'IR Block', value: '98%' },
      { key: 'UV Block', value: '99.9%' },
      { key: 'VLT', value: '12.2%' },
    ],
  },
  {
    sku: 'LEX-B55',
    slug: 'phim-cach-nhiet-ultra-nano-ceramic-b55',
    name: 'Phim cách nhiệt Ultra Nano Ceramic B55',
    categoryCode: FILM_CATEGORY,
    brand: 'Lexzenz',
    model: 'B55',
    description:
      'Phim Nano Ceramic cho kính lái với độ trong cao và khả năng cản tia hồng ngoại.',
    warrantyDurationMonths: 180,
    specifications: [
      { key: 'IR Block', value: '99%' },
      { key: 'UV Block', value: '99.9%' },
      { key: 'VLT', value: '59.7%' },
    ],
  },
  {
    sku: 'LEX-B15',
    slug: 'phim-cach-nhiet-ultra-nano-ceramic-b15',
    name: 'Phim cách nhiệt Ultra Nano Ceramic B15',
    categoryCode: FILM_CATEGORY,
    brand: 'Lexzenz',
    model: 'B15',
    description:
      'Phim Nano Ceramic dành cho kính sườn và kính hậu, tăng sự riêng tư cho khoang xe.',
    warrantyDurationMonths: 180,
    specifications: [
      { key: 'IR Block', value: '99%' },
      { key: 'UV Block', value: '99.9%' },
      { key: 'VLT', value: '16%' },
    ],
  },
  {
    sku: 'LEX-L50',
    slug: 'phim-cach-nhiet-nano-ceramic-l50',
    name: 'Phim cách nhiệt Nano Ceramic L50',
    categoryCode: FILM_CATEGORY,
    brand: 'Lexzenz',
    model: 'L50',
    description:
      'Phim Nano Ceramic có độ xuyên sáng phù hợp cho kính lái và tầm nhìn ban đêm.',
    warrantyDurationMonths: 120,
    specifications: [
      { key: 'IR Block', value: '92%' },
      { key: 'UV Block', value: '99.9%' },
      { key: 'VLT', value: '49%' },
    ],
  },
  {
    sku: 'LEX-L15',
    slug: 'phim-cach-nhiet-nano-ceramic-l15',
    name: 'Phim cách nhiệt Nano Ceramic L15',
    categoryCode: FILM_CATEGORY,
    brand: 'Lexzenz',
    model: 'L15',
    description:
      'Phim Nano Ceramic tông tối cho kính sườn và kính hậu, hỗ trợ giảm chói.',
    warrantyDurationMonths: 120,
    specifications: [
      { key: 'IR Block', value: '85%' },
      { key: 'UV Block', value: '99.9%' },
      { key: 'VLT', value: '15%' },
    ],
  },
  {
    sku: 'FUJI-LED-MINI-X1',
    slug: 'bong-led-bi-cau-mini-x1-high-power',
    name: 'Bóng LED Bi cầu Mini X1 High Power',
    categoryCode: LIGHTING_CATEGORY,
    brand: 'Fujitek',
    model: 'Mini X1',
    description:
      'Bóng LED bi cầu mini dành cho nhu cầu nâng cấp ánh sáng ô tô và xe máy.',
    warrantyDurationMonths: 36,
    specifications: [
      { key: 'Công suất', value: '55W' },
      { key: 'Nhiệt màu', value: '6000K' },
      { key: 'Điện áp', value: '12V' },
    ],
  },
  {
    sku: 'FUJI-BILED-FOG-PRO',
    slug: 'bi-led-gam-chong-nuoc-ip68-laser-pro',
    name: 'Bi LED Gầm chống nước IP68 Laser Pro',
    categoryCode: LIGHTING_CATEGORY,
    brand: 'Fujitek',
    model: 'Fog Laser Pro',
    description:
      'Bi LED gầm có khả năng chống nước, hỗ trợ ánh sáng bám đường khi thời tiết xấu.',
    warrantyDurationMonths: 36,
    specifications: [
      { key: 'Chống nước', value: 'IP68' },
      { key: 'Quang thông', value: '12,000 LM' },
      { key: 'Điện áp', value: '12V - 24V' },
    ],
  },
  {
    sku: 'FUJI-AUX-SPOT-40W',
    slug: 'den-tro-sang-offroad-matrix-spot-40w',
    name: 'Đèn trợ sáng Offroad Matrix Spot 40W',
    categoryCode: LIGHTING_CATEGORY,
    brand: 'Fujitek',
    model: 'Matrix Spot 40W',
    description:
      'Đèn trợ sáng chùm xa dành cho xe địa hình và điều kiện đường thiếu sáng.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Công suất', value: '40W' },
      { key: 'Tầm chiếu', value: '300m' },
      { key: 'Chống nước', value: 'IP67' },
    ],
  },
  {
    sku: 'FUJI-GT-LASER-90W',
    slug: 'bi-led-laser-gt-ultra-90w',
    name: 'Bi LED Laser GT Ultra 90W',
    categoryCode: LIGHTING_CATEGORY,
    brand: 'Fujitek',
    model: 'GT Ultra 90W',
    description:
      'Bi LED Laser hiệu suất cao với luồng sáng mạnh và đường cắt rõ.',
    warrantyDurationMonths: 36,
    specifications: [
      { key: 'Công suất', value: '90W' },
      { key: 'Chip LED', value: 'OSRAM' },
      { key: 'Nhiệt màu', value: '5500K' },
    ],
  },
  {
    sku: 'FUJI-G3-LAZER-60W',
    slug: 'bi-led-gam-g3-lazer-60w',
    name: 'Bi LED Gầm G3 Lazer 60W',
    categoryCode: LIGHTING_CATEGORY,
    brand: 'Fujitek',
    model: 'G3 Lazer',
    description:
      'Bi LED gầm thế hệ G3 cho ánh sáng gom tốt và hỗ trợ ba chế độ màu.',
    warrantyDurationMonths: 36,
    specifications: [
      { key: 'Công suất', value: '60W' },
      { key: 'Nhiệt màu', value: '3000K / 4800K / 6000K' },
      { key: 'Chống nước', value: 'IP67' },
    ],
  },
  {
    sku: 'FUJI-F1-PRO-85W',
    slug: 'bong-led-fujitek-f1-pro-85w',
    name: 'Bóng LED Fujitek F1 Pro 85W',
    categoryCode: LIGHTING_CATEGORY,
    brand: 'Fujitek',
    model: 'F1 Pro',
    description:
      'Bóng LED công suất cao với thiết kế tản nhiệt chủ động cho xe ô tô.',
    warrantyDurationMonths: 36,
    specifications: [
      { key: 'Công suất', value: '85W' },
      { key: 'Điện áp', value: '9V - 36V' },
      { key: 'Nhiệt màu', value: '6000K' },
    ],
  },
  {
    sku: 'LEX-CAM-4K-GPS',
    slug: 'camera-hanh-trinh-4k-truoc-sau-gps',
    name: 'Camera hành trình 4K trước sau GPS',
    categoryCode: DASHCAM_CATEGORY,
    brand: 'Lexzenz',
    model: '4K GPS',
    description:
      'Camera hành trình hai kênh độ phân giải cao, hỗ trợ ghi lại hành trình và vị trí.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Độ phân giải', value: '4K UHD' },
      { key: 'Cảm biến', value: 'Sony Starvis 2' },
      { key: 'Kết nối', value: 'WiFi / GPS' },
    ],
  },
  {
    sku: 'LEX-CAM-2K-MINI',
    slug: 'camera-hanh-trinh-mini-2k-wifi-6',
    name: 'Camera hành trình Mini 2K WiFi 6',
    categoryCode: DASHCAM_CATEGORY,
    brand: 'Lexzenz',
    model: 'Mini 2K',
    description:
      'Camera hành trình kích thước nhỏ gọn, hỗ trợ xem và tải video qua WiFi.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Độ phân giải', value: '2K 1440P' },
      { key: 'Kết nối', value: 'WiFi 6' },
      { key: 'Góc quay', value: '150°' },
    ],
  },
  {
    sku: 'LEX-CAM-4K-DUAL',
    slug: 'camera-hanh-trinh-4k-dual-channel',
    name: 'Camera hành trình 4K Dual Channel',
    categoryCode: DASHCAM_CATEGORY,
    brand: 'Lexzenz',
    model: '4K Dual',
    description:
      'Camera hành trình trước sau với chế độ ghi hình đồng thời hai kênh.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Camera trước', value: '4K' },
      { key: 'Camera sau', value: '2K' },
      { key: 'Góc quay', value: '160°' },
    ],
  },
  {
    sku: 'LEX-CAM-3CH-SONY',
    slug: 'camera-hanh-trinh-3-kenh-sony-starvis',
    name: 'Camera hành trình 3 kênh Sony Starvis',
    categoryCode: DASHCAM_CATEGORY,
    brand: 'Lexzenz',
    model: '3CH Sony',
    description:
      'Camera hành trình ba kênh ghi hình phía trước, trong cabin và phía sau.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Số kênh', value: '3' },
      { key: 'Cảm biến', value: 'Sony Starvis' },
      { key: 'Hồng ngoại', value: 'Có' },
    ],
  },
  {
    sku: 'LEX-CAM-MIRROR-2K',
    slug: 'camera-hanh-trinh-guong-2k-cam-ung',
    name: 'Camera hành trình gương 2K cảm ứng',
    categoryCode: DASHCAM_CATEGORY,
    brand: 'Lexzenz',
    model: 'Mirror 2K',
    description:
      'Camera hành trình tích hợp màn hình gương cảm ứng và camera lùi.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Độ phân giải', value: '2K' },
      { key: 'Màn hình', value: '11 inch' },
      { key: 'Điều khiển', value: 'Cảm ứng' },
    ],
  },
  {
    sku: 'LEX-CAM-PARKING-AI',
    slug: 'camera-hanh-trinh-parking-ai',
    name: 'Camera hành trình Parking AI',
    categoryCode: DASHCAM_CATEGORY,
    brand: 'Lexzenz',
    model: 'Parking AI',
    description:
      'Camera hành trình hỗ trợ giám sát đỗ xe và nhận diện tình huống bằng AI.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Giám sát đỗ xe', value: '24 giờ' },
      { key: 'Nhận diện', value: 'AI' },
      { key: 'Kết nối', value: 'WiFi' },
    ],
  },
  {
    sku: 'LEX-TPMS-SOLAR-V2',
    slug: 'cam-bien-ap-suat-lop-nang-luong-mat-troi-v2',
    name: 'Cảm biến áp suất lốp năng lượng mặt trời V2',
    categoryCode: TPMS_CATEGORY,
    brand: 'Lexzenz',
    model: 'Solar V2',
    description:
      'Bộ cảm biến áp suất lốp sử dụng màn hình sạc năng lượng mặt trời.',
    warrantyDurationMonths: 36,
    specifications: [
      { key: 'Nguồn điện', value: 'Năng lượng mặt trời' },
      { key: 'Cảnh báo', value: 'Màn hình và âm thanh' },
      { key: 'Số lốp', value: '4' },
    ],
  },
  {
    sku: 'LEX-TPMS-PRO-EXT',
    slug: 'cam-bien-ap-suat-lop-van-ngoai-bluetooth',
    name: 'Cảm biến áp suất lốp van ngoài Bluetooth',
    categoryCode: TPMS_CATEGORY,
    brand: 'Lexzenz',
    model: 'Pro External',
    description:
      'Bộ cảm biến van ngoài dễ lắp đặt và kết nối với thiết bị qua Bluetooth.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Loại van', value: 'Van ngoài' },
      { key: 'Kết nối', value: 'Bluetooth 5.0' },
      { key: 'Chống nước', value: 'IP67' },
    ],
  },
  {
    sku: 'LEX-TPMS-USB-C',
    slug: 'cam-bien-ap-suat-lop-man-hinh-usb-c',
    name: 'Cảm biến áp suất lốp màn hình USB-C',
    categoryCode: TPMS_CATEGORY,
    brand: 'Lexzenz',
    model: 'USB-C Display',
    description: 'Bộ cảm biến áp suất lốp có màn hình màu và cổng sạc USB-C.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Nguồn điện', value: 'USB-C' },
      { key: 'Màn hình', value: 'LCD màu' },
      { key: 'Cảnh báo', value: 'Áp suất và nhiệt độ' },
    ],
  },
  {
    sku: 'LEX-TPMS-INTERNAL',
    slug: 'cam-bien-ap-suat-lop-van-trong-pro',
    name: 'Cảm biến áp suất lốp van trong Pro',
    categoryCode: TPMS_CATEGORY,
    brand: 'Lexzenz',
    model: 'Internal Pro',
    description:
      'Bộ cảm biến van trong ổn định, phù hợp sử dụng lâu dài trên ô tô.',
    warrantyDurationMonths: 36,
    specifications: [
      { key: 'Loại van', value: 'Van trong' },
      { key: 'Tuổi thọ pin', value: '5 năm' },
      { key: 'Chống nước', value: 'IP67' },
    ],
  },
  {
    sku: 'LEX-TPMS-MOTOR',
    slug: 'cam-bien-ap-suat-lop-xe-may',
    name: 'Cảm biến áp suất lốp xe máy',
    categoryCode: TPMS_CATEGORY,
    brand: 'Lexzenz',
    model: 'Moto TPMS',
    description: 'Bộ cảm biến áp suất lốp hai bánh dành cho xe máy và mô tô.',
    warrantyDurationMonths: 24,
    specifications: [
      { key: 'Số lốp', value: '2' },
      { key: 'Màn hình', value: 'LCD' },
      { key: 'Chống nước', value: 'IP67' },
    ],
  },
  {
    sku: 'LEX-TPMS-PRO-6',
    slug: 'cam-bien-ap-suat-lop-pro-6-banh',
    name: 'Cảm biến áp suất lốp Pro 6 bánh',
    categoryCode: TPMS_CATEGORY,
    brand: 'Lexzenz',
    model: 'Pro 6',
    description:
      'Bộ cảm biến áp suất lốp dành cho xe bán tải và xe có tối đa sáu bánh.',
    warrantyDurationMonths: 36,
    specifications: [
      { key: 'Số lốp', value: '6' },
      { key: 'Cảnh báo', value: 'Áp suất và nhiệt độ' },
      { key: 'Khoảng cách truyền', value: '20m' },
    ],
  },
] satisfies LexzenzProductSeed[];

const requiredCategoryCodes = [
  FILM_CATEGORY,
  LIGHTING_CATEGORY,
  DASHCAM_CATEGORY,
  TPMS_CATEGORY,
] as const;

const PHYSICAL_PRODUCTS_PER_TEMPLATE = 2;
const SEEDED_WARRANTY_YEAR = 2026;
const WARRANTY_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function createSeedWarrantyCode(templateIndex: number, productIndex: number) {
  let value = templateIndex * PHYSICAL_PRODUCTS_PER_TEMPLATE + productIndex;
  let suffix = '';

  for (let index = 0; index < 5; index += 1) {
    suffix =
      WARRANTY_CODE_ALPHABET.charAt(value % WARRANTY_CODE_ALPHABET.length) +
      suffix;
    value = Math.floor(value / WARRANTY_CODE_ALPHABET.length);
  }

  return `WM-${SEEDED_WARRANTY_YEAR}-S${suffix}`;
}

export async function seedLexzenzProducts(client: LexzenzProductSeedClient) {
  const categories = await client.category.findMany({
    where: {
      code: { in: [...requiredCategoryCodes] },
      type: category_type.PRODUCT,
    },
    select: { code: true, id: true },
  });
  const categoryIdByCode = new Map(
    categories.flatMap((category) =>
      category.code ? [[category.code, category.id] as const] : [],
    ),
  );
  const missingCategoryCodes = requiredCategoryCodes.filter(
    (code) => !categoryIdByCode.has(code),
  );

  if (missingCategoryCodes.length > 0) {
    throw new Error(
      `Missing product categories: ${missingCategoryCodes.join(', ')}`,
    );
  }

  for (const [index, productSeed] of lexzenzProductSeeds.entries()) {
    const categoryId = categoryIdByCode.get(productSeed.categoryCode);
    if (!categoryId) {
      throw new Error(`Missing product category: ${productSeed.categoryCode}`);
    }

    const publishedAt = new Date(
      Date.UTC(2026, 0, lexzenzProductSeeds.length - index),
    );
    const detailMetadata = categoryDetailMetadata[productSeed.categoryCode];
    const productMetadata: Prisma.InputJsonObject = {
      applications: detailMetadata.applications,
      features: detailMetadata.features,
      shortDescription: productSeed.description,
      specifications: productSeed.specifications,
    };
    for (
      let productIndex = 0;
      productIndex < PHYSICAL_PRODUCTS_PER_TEMPLATE;
      productIndex += 1
    ) {
      const sequence = String(productIndex + 1).padStart(2, '0');
      const productCode = `PRD-${productSeed.sku}-${sequence}`;
      const serialNumber = `SN-${productSeed.sku}-${sequence}`;
      const warrantyCode = createSeedWarrantyCode(index, productIndex);
      const displayName = `${productSeed.name} #${sequence}`;

      const product = await client.product.upsert({
        where: { product_code: productCode },
        update: {
          category_id: categoryId,
          catalogue_brand: productSeed.brand,
          catalogue_description: productSeed.description,
          catalogue_is_published: true,
          catalogue_metadata: productMetadata,
          catalogue_model: productSeed.model,
          catalogue_name: productSeed.name,
          catalogue_published_at: publishedAt,
          catalogue_sku: productCode,
          catalogue_slug: `${productSeed.slug}-${productCode.toLowerCase()}`,
          deleted_at: null,
          display_name: displayName,
          serial_number: serialNumber,
          status: product_status.ACTIVE,
        },
        create: {
          category_id: categoryId,
          catalogue_brand: productSeed.brand,
          catalogue_description: productSeed.description,
          catalogue_is_published: true,
          catalogue_metadata: productMetadata,
          catalogue_model: productSeed.model,
          catalogue_name: productSeed.name,
          catalogue_published_at: publishedAt,
          catalogue_sku: productCode,
          catalogue_slug: `${productSeed.slug}-${productCode.toLowerCase()}`,
          display_name: displayName,
          product_code: productCode,
          serial_number: serialNumber,
          status: product_status.ACTIVE,
        },
      });

      await client.warranty.upsert({
        where: { product_id: product.id },
        update: {
          duration_months: productSeed.warrantyDurationMonths,
          end_date: null,
          start_date: null,
          status: warranty_status.DRAFT,
          terms: null,
          warranty_code: warrantyCode,
        },
        create: {
          duration_months: productSeed.warrantyDurationMonths,
          end_date: null,
          product_id: product.id,
          start_date: null,
          status: warranty_status.DRAFT,
          terms: null,
          warranty_code: warrantyCode,
        },
      });
    }
  }

  console.log(
    `Seeded ${lexzenzProductSeeds.length * PHYSICAL_PRODUCTS_PER_TEMPLATE} physical Lexzenz products.`,
  );
}

let prisma: PrismaClient | undefined;

async function main() {
  console.log('Seeding Lexzenz products...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  await seedLexzenzProducts(prisma);
  console.log('Lexzenz product seed completed successfully.');
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Error seeding Lexzenz products:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma?.$disconnect();
    });
}
