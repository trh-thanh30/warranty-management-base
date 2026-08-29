import { GetPublicProductDetailUseCase } from '@/modules/products/use-cases/get-public-product-detail.use-case';
import { toPublicProductSummary } from '@/modules/products/products.types';
import { NotFoundException } from '@nestjs/common';
import {
  asset_access_type,
  asset_type,
  category_type,
  product_asset_role,
} from '@prisma/client';

describe('GetPublicProductDetailUseCase', () => {
  it('maps one public card from the authoritative product', () => {
    const template = createPublishedTemplateFixture();

    expect(
      toPublicProductSummary(
        template,
        (asset) => `https://cdn.example.com/${asset.path}`,
      ),
    ).toEqual({
      id: 'template-id',
      sku: 'LEX-SP50',
      slug: 'lex-sp50',
      name: 'SP50',
      categoryId: 'category-id',
      category: {
        id: 'category-id',
        slug: 'film',
        name: 'Film cách nhiệt',
      },
      brand: 'Lexzenz',
      model: 'SP50',
      description: 'Mô tả đầy đủ.',
      coverImageUrl: 'https://cdn.example.com/products/sp50-cover.jpg',
      specifications: [
        { key: 'IR Block', value: '97%', group: 'Hiệu suất' },
        { key: 'VLT', value: '50.6%' },
      ],
      warrantyDurationMonths: 180,
      publishedAt: new Date('2026-01-24T00:00:00.000Z'),
    });
  });

  it('maps one published product into the public detail contract', async () => {
    const repository = {
      findPublicProductBySlug: jest
        .fn()
        .mockResolvedValue(createPublishedTemplateFixture()),
    };
    const assetsService = {
      enrichAssetUrl: jest.fn((asset: { path: string }) => ({
        ...asset,
        url: `https://cdn.example.com/${asset.path}`,
      })),
    };
    const useCase = new GetPublicProductDetailUseCase(
      repository as never,
      assetsService as never,
    );

    await expect(useCase.execute('lex-sp50')).resolves.toEqual({
      id: 'template-id',
      sku: 'LEX-SP50',
      slug: 'lex-sp50',
      name: 'SP50',
      category: {
        id: 'category-id',
        slug: 'film',
        name: 'Film cách nhiệt',
      },
      brand: 'Lexzenz',
      model: 'SP50',
      modelYear: 2026,
      shortDescription: 'Phim dành cho kính lái.',
      description: 'Mô tả đầy đủ.',
      coverImage: {
        id: 'cover-link-id',
        url: 'https://cdn.example.com/products/sp50-cover.jpg',
        altText: 'SP50 cover',
        sortOrder: 0,
      },
      galleryImages: [
        {
          id: 'gallery-link-id',
          url: 'https://cdn.example.com/products/sp50-gallery.jpg',
          altText: null,
          sortOrder: 1,
        },
      ],
      specifications: [
        { key: 'IR Block', value: '97%', group: 'Hiệu suất' },
        { key: 'VLT', value: '50.6%' },
      ],
      features: ['Cản tia hồng ngoại', 'Giữ tầm nhìn rõ'],
      applications: ['Kính lái ô tô'],
      warranty: {
        durationMonths: 180,
        terms: 'Bảo hành điện tử chính hãng.',
      },
      publishedAt: new Date('2026-01-24T00:00:00.000Z'),
    });
  });

  it('throws not found when the slug is not publicly available', async () => {
    const repository = {
      findPublicProductBySlug: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GetPublicProductDetailUseCase(
      repository as never,
      { enrichAssetUrl: jest.fn() } as never,
    );

    await expect(useCase.execute('hidden-product')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

function createPublishedTemplateFixture() {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const category = {
    id: 'category-id',
    type: category_type.PRODUCT,
    code: 'LEXZENZ_REFLEX_KOREA_FILM',
    slug: 'film',
    name: 'Film cách nhiệt',
    description: null,
    parent_id: null,
    icon: null,
    image_url: null,
    order: 10,
    is_active: true,
    activation_form_enabled: false,
    metadata: null,
    created_at: createdAt,
    updated_at: createdAt,
  };
  const createAsset = (input: {
    id: string;
    path: string;
    originalName: string;
  }) => ({
    id: input.id,
    original_name: input.originalName,
    filename: input.originalName,
    mime_type: 'image/jpeg',
    size: 1024,
    path: input.path,
    access_type: asset_access_type.PUBLIC,
    type: asset_type.IMAGE,
    folder: 'products',
    metadata: null,
    is_deleted: false,
    uploaded_by_id: null,
    created_at: createdAt,
    updated_at: createdAt,
  });

  return {
    id: 'template-id',
    product_code: 'LEX-SP50',
    serial_number: null,
    display_name: null,
    category_id: category.id,
    category_ref: category,
    catalogue_name: 'SP50',
    catalogue_sku: 'LEX-SP50',
    catalogue_slug: 'lex-sp50',
    catalogue_brand: 'Lexzenz',
    catalogue_model: 'SP50',
    catalogue_model_year: 2026,
    catalogue_description: 'Mô tả đầy đủ.',
    catalogue_metadata: {
      shortDescription: 'Phim dành cho kính lái.',
      specifications: [
        { key: 'IR Block', value: '97%', group: 'Hiệu suất' },
        { key: 'VLT', value: '50.6%' },
        { key: 'Invalid item' },
      ],
      features: ['Cản tia hồng ngoại', 'Giữ tầm nhìn rõ', 42],
      applications: ['Kính lái ô tô'],
    },
    catalogue_is_published: true,
    catalogue_published_at: new Date('2026-01-24T00:00:00.000Z'),
    status: 'ACTIVE' as const,
    metadata: null,
    deleted_at: null,
    warranty: {
      duration_months: 180,
      terms: 'Bảo hành điện tử chính hãng.',
    },
    created_at: createdAt,
    updated_at: createdAt,
    assets: [
      {
        id: 'cover-link-id',
        product_id: 'template-id',
        asset_id: 'cover-asset-id',
        role: product_asset_role.COVER,
        sort_order: 0,
        alt_text: 'SP50 cover',
        created_at: createdAt,
        updated_at: createdAt,
        asset: createAsset({
          id: 'cover-asset-id',
          path: 'products/sp50-cover.jpg',
          originalName: 'sp50-cover.jpg',
        }),
      },
      {
        id: 'gallery-link-id',
        product_id: 'template-id',
        asset_id: 'gallery-asset-id',
        role: product_asset_role.GALLERY,
        sort_order: 1,
        alt_text: null,
        created_at: createdAt,
        updated_at: createdAt,
        asset: createAsset({
          id: 'gallery-asset-id',
          path: 'products/sp50-gallery.jpg',
          originalName: 'sp50-gallery.jpg',
        }),
      },
    ],
  };
}
