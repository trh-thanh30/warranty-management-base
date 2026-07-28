import { PrismaPg } from '@prisma/adapter-pg';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  asset_access_type,
  asset_type,
  Prisma,
  PrismaClient,
  website_locale,
  website_revision_state,
  website_social_platform,
} from '@prisma/client';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Pool } from 'pg';

const SITE_KEY = 'main';
const CONTACT_EMAIL = 'admin@lexzenz.vn';
const WEBSITE_URL = 'https://fujitekvietnam.com';
const WEBSITE_LOGO_FILE_NAME = 'logo_2.png';
const WEBSITE_LOGO_SOURCE_PATH = resolve(
  __dirname,
  '../../web/public',
  WEBSITE_LOGO_FILE_NAME,
);
const WEBSITE_LOGO_FOLDER = 'website-config';
const WEBSITE_LOGO_OBJECT_KEY = `${WEBSITE_LOGO_FOLDER}/${WEBSITE_LOGO_FILE_NAME}`;
const WEBSITE_LOGO_MIME_TYPE = 'image/png';

const offices = [
  {
    isActive: true,
    isHeadquarters: true,
    phone: '0886 33 77 33',
    sortOrder: 0,
    address: '7C Nguyễn Ngọc Phương, Phường Thạnh Mỹ Tây, TP. Hồ Chí Minh',
    label: 'Văn phòng TP. Hồ Chí Minh',
  },
  {
    isActive: true,
    isHeadquarters: false,
    phone: '0989 017 999',
    sortOrder: 1,
    address: 'Số 62, Ngõ 20 Nghĩa Đô, Phường Nghĩa Đô, TP. Hà Nội',
    label: 'Văn phòng Hà Nội',
  },
] as const;

const socialLinks = [
  {
    isActive: true,
    label: 'Facebook',
    platform: website_social_platform.FACEBOOK,
    sortOrder: 0,
    url: 'https://www.facebook.com/fujitek.lexzenz.vietnam',
  },
  {
    isActive: true,
    label: 'Zalo',
    platform: website_social_platform.ZALO,
    sortOrder: 1,
    url: 'https://zalo.me/0886337733',
  },
] as const;

/**
 * Seeds one published configuration for the public Web and one editable draft
 * for Admin. Re-running updates the shared contact, social, header logo, and
 * footer logo data without creating duplicate seeded assets.
 */
export async function seedWebsiteSiteSettings(client: PrismaClient) {
  const logoAssetId = await seedWebsiteLogoAsset(client);

  await client.$transaction(async (tx) => {
    const currentPublished = await tx.websiteSiteRevision.findFirst({
      where: {
        site_key: SITE_KEY,
        state: website_revision_state.PUBLISHED,
      },
      orderBy: { revision_number: 'desc' },
    });
    const publishedRevisionNumber = currentPublished?.revision_number ?? 1;

    const published = await replaceRevisionContent(
      tx,
      currentPublished,
      website_revision_state.PUBLISHED,
      publishedRevisionNumber,
      logoAssetId,
    );

    const currentDraft = await tx.websiteSiteRevision.findFirst({
      where: {
        site_key: SITE_KEY,
        state: website_revision_state.DRAFT,
      },
      orderBy: { updated_at: 'desc' },
    });

    await replaceRevisionContent(
      tx,
      currentDraft,
      website_revision_state.DRAFT,
      published.revision_number + 1,
      logoAssetId,
    );
  });

  console.log(
    `Seeded published and draft website contact/social/logo configuration for "${SITE_KEY}".`,
  );
}

async function replaceRevisionContent(
  tx: Prisma.TransactionClient,
  revision: {
    id: string;
    published_at: Date | null;
  } | null,
  state: website_revision_state,
  revisionNumber: number,
  logoAssetId: string,
) {
  if (revision) {
    await Promise.all([
      tx.websiteOffice.deleteMany({ where: { revision_id: revision.id } }),
      tx.websiteSocialLink.deleteMany({
        where: { revision_id: revision.id },
      }),
    ]);

    return tx.websiteSiteRevision.update({
      where: { id: revision.id },
      data: {
        contact_email: CONTACT_EMAIL,
        footer_logo_asset_id: logoAssetId,
        header_logo_asset_id: logoAssetId,
        lock_version: { increment: 1 },
        published_at:
          state === website_revision_state.PUBLISHED
            ? (revision.published_at ?? new Date())
            : null,
        revision_number: revisionNumber,
        state,
        website_url: WEBSITE_URL,
        offices: { create: officeCreateInputs() },
        social_links: { create: socialLinkCreateInputs() },
      },
    });
  }

  return tx.websiteSiteRevision.create({
    data: {
      contact_email: CONTACT_EMAIL,
      footer_logo_asset_id: logoAssetId,
      header_logo_asset_id: logoAssetId,
      published_at:
        state === website_revision_state.PUBLISHED ? new Date() : null,
      revision_number: revisionNumber,
      site_key: SITE_KEY,
      state,
      website_url: WEBSITE_URL,
      offices: { create: officeCreateInputs() },
      social_links: { create: socialLinkCreateInputs() },
    },
  });
}

async function seedWebsiteLogoAsset(client: PrismaClient) {
  const logoBuffer = await readFile(WEBSITE_LOGO_SOURCE_PATH);
  const storagePath = await uploadWebsiteLogo(logoBuffer);
  const checksum = createHash('sha256').update(logoBuffer).digest('hex');
  const existingAsset = await client.asset.findFirst({
    where: { path: storagePath },
    orderBy: { created_at: 'asc' },
  });
  const data = {
    access_type: asset_access_type.PUBLIC,
    filename: WEBSITE_LOGO_FILE_NAME,
    folder: WEBSITE_LOGO_FOLDER,
    is_deleted: false,
    metadata: {
      checksum,
      seedKey: 'website-site-logo',
      source: 'apps/web/public/logo_2.png',
    },
    mime_type: WEBSITE_LOGO_MIME_TYPE,
    original_name: WEBSITE_LOGO_FILE_NAME,
    path: storagePath,
    size: logoBuffer.byteLength,
    type: asset_type.IMAGE,
  } satisfies Prisma.AssetUncheckedCreateInput;

  const asset = existingAsset
    ? await client.asset.update({
        where: { id: existingAsset.id },
        data,
      })
    : await client.asset.create({ data });

  return asset.id;
}

async function uploadWebsiteLogo(logoBuffer: Buffer) {
  const publicDirName = process.env.STORAGE_PUBLIC_DIR_NAME ?? 'public';
  const storagePath = `${publicDirName}/${WEBSITE_LOGO_OBJECT_KEY}`;

  if ((process.env.STORAGE_DRIVER ?? 'local') !== 'minio') {
    const storageRoot = resolve(
      process.cwd(),
      process.env.STORAGE_ROOT_DIR ?? '/app/storage',
    );
    const targetPath = resolve(storageRoot, storagePath);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, logoBuffer);
    return storagePath;
  }

  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error(
      'MINIO_ACCESS_KEY and MINIO_SECRET_KEY are required to seed the website logo',
    );
  }

  const useSsl = process.env.MINIO_USE_SSL === 'true';
  const endpoint = process.env.MINIO_ENDPOINT ?? 'minio';
  const port = process.env.MINIO_PORT ?? '9000';
  const bucket =
    process.env.MINIO_BUCKET_PUBLIC ?? 'warranty-management-base-public';
  const client = new S3Client({
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    endpoint: `${useSsl ? 'https' : 'http'}://${endpoint}:${port}`,
    forcePathStyle: true,
    region: process.env.MINIO_REGION ?? 'us-east-1',
  });

  try {
    await client.send(
      new PutObjectCommand({
        Body: logoBuffer,
        Bucket: bucket,
        ContentLength: logoBuffer.byteLength,
        ContentType: WEBSITE_LOGO_MIME_TYPE,
        Key: WEBSITE_LOGO_OBJECT_KEY,
      }),
    );
  } finally {
    client.destroy();
  }

  return storagePath;
}

function officeCreateInputs(): Prisma.WebsiteOfficeCreateWithoutRevisionInput[] {
  return offices.map((office) => ({
    is_active: office.isActive,
    is_headquarters: office.isHeadquarters,
    phone: office.phone,
    sort_order: office.sortOrder,
    translations: {
      create: {
        address: office.address,
        label: office.label,
        locale: website_locale.VI,
      },
    },
  }));
}

function socialLinkCreateInputs(): Prisma.WebsiteSocialLinkCreateWithoutRevisionInput[] {
  return socialLinks.map((social) => ({
    is_active: social.isActive,
    label: social.label,
    platform: social.platform,
    sort_order: social.sortOrder,
    url: social.url,
  }));
}

let prisma: PrismaClient | undefined;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  await seedWebsiteSiteSettings(prisma);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Error seeding website site settings:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma?.$disconnect();
    });
}
