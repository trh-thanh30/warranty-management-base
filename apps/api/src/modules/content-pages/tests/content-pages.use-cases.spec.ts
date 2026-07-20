import { ConflictError, NotFoundError } from '@/common/response';
import { DeleteContentPageUseCase } from '@/modules/content-pages/use-cases/delete-content-page.use-case';
import { CreateContentPageUseCase } from '@/modules/content-pages/use-cases/create-content-page.use-case';
import { GetPublishedContentPageBySlugUseCase } from '@/modules/content-pages/use-cases/get-published-content-page-by-slug.use-case';
import { ListPublishedContentPagesUseCase } from '@/modules/content-pages/use-cases/list-published-content-pages.use-case';
import { UpdateContentPageUseCase } from '@/modules/content-pages/use-cases/update-content-page.use-case';
import { content_page_kind, content_page_status } from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

const page = {
  id: 'page-id',
  slug: 'chinh-sach-bao-hanh',
  title: 'Chinh sach bao hanh',
  summary: 'Tom tat',
  content: 'Noi dung',
  kind: content_page_kind.POLICY,
  status: content_page_status.PUBLISHED,
  published_at: new Date('2026-07-03T00:00:00.000Z'),
  created_at: new Date('2026-07-03T00:00:00.000Z'),
  updated_at: new Date('2026-07-03T00:00:00.000Z'),
};

describe('Content page use cases', () => {
  const contentPagesRepository = {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findPublishedBySlug: jest.fn(),
    listPublished: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a published content page and assigns publishedAt', async () => {
    contentPagesRepository.findBySlug.mockResolvedValue(null);
    contentPagesRepository.create.mockResolvedValue(page);
    const useCase = new CreateContentPageUseCase(
      contentPagesRepository as never,
    );

    const result = await useCase.execute({
      slug: 'Chinh-Sach-Bao-Hanh'.toLowerCase(),
      title: ' Chinh sach bao hanh ',
      content: ' Noi dung ',
      status: content_page_status.PUBLISHED,
    });

    expect(contentPagesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'chinh-sach-bao-hanh',
        title: 'Chinh sach bao hanh',
        content: 'Noi dung',
        status: content_page_status.PUBLISHED,
        published_at: expect.any(Date),
      }),
    );
    expect(result.slug).toBe('chinh-sach-bao-hanh');
  });

  it('rejects duplicate slugs on create', async () => {
    contentPagesRepository.findBySlug.mockResolvedValue(page);
    const useCase = new CreateContentPageUseCase(
      contentPagesRepository as never,
    );

    await expect(
      useCase.execute({
        slug: 'chinh-sach-bao-hanh',
        title: 'Chinh sach bao hanh',
        content: 'Noi dung',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('updates a content page and preserves publishedAt when still published', async () => {
    contentPagesRepository.findById.mockResolvedValue(page);
    contentPagesRepository.update.mockResolvedValue({
      ...page,
      title: 'Huong dan moi',
    });
    const useCase = new UpdateContentPageUseCase(
      contentPagesRepository as never,
    );

    const result = await useCase.execute('page-id', {
      title: ' Huong dan moi ',
    });

    expect(contentPagesRepository.update).toHaveBeenCalledWith(
      'page-id',
      expect.objectContaining({
        title: 'Huong dan moi',
        published_at: page.published_at,
      }),
    );
    expect(result.title).toBe('Huong dan moi');
  });

  it('deletes rich-text assets removed during content update', async () => {
    const assetsService = {
      deleteAssetByUrl: jest.fn().mockResolvedValue(true),
    };
    contentPagesRepository.findById.mockResolvedValue({
      ...page,
      content:
        '<p>Old</p><img src="https://cdn.example.com/rich-text/old.jpg">',
    });
    contentPagesRepository.update.mockResolvedValue({
      ...page,
      content: '<p>New</p>',
    });
    const useCase = new UpdateContentPageUseCase(
      contentPagesRepository as never,
      assetsService as never,
    );

    await useCase.execute('page-id', { content: '<p>New</p>' });

    expect(assetsService.deleteAssetByUrl).toHaveBeenCalledWith(
      'https://cdn.example.com/rich-text/old.jpg',
      expect.objectContaining({ folder: 'rich-text' }),
    );
  });

  it('deletes rich-text assets before deleting a content page', async () => {
    const assetsService = {
      deleteAssetByUrl: jest.fn().mockResolvedValue(true),
    };
    contentPagesRepository.findById.mockResolvedValue({
      ...page,
      content:
        '<p>Old</p><video src="https://cdn.example.com/rich-text/video.mp4"></video>',
    });
    contentPagesRepository.delete.mockResolvedValue(page);
    const useCase = new DeleteContentPageUseCase(
      contentPagesRepository as never,
      assetsService as never,
    );

    await useCase.execute('page-id');

    expect(assetsService.deleteAssetByUrl).toHaveBeenCalledWith(
      'https://cdn.example.com/rich-text/video.mp4',
      expect.objectContaining({ folder: 'rich-text' }),
    );
    expect(contentPagesRepository.delete).toHaveBeenCalledWith('page-id');
  });

  it('throws not found when reading missing published content', async () => {
    contentPagesRepository.findPublishedBySlug.mockResolvedValue(null);
    const useCase = new GetPublishedContentPageBySlugUseCase(
      contentPagesRepository as never,
    );

    await expect(useCase.execute('missing-page')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('lists only published content pages for public API', async () => {
    contentPagesRepository.listPublished.mockResolvedValue({
      items: [page],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    const useCase = new ListPublishedContentPagesUseCase(
      contentPagesRepository as never,
    );

    const result = await useCase.execute({
      kind: content_page_kind.POLICY,
    });

    expect(contentPagesRepository.listPublished).toHaveBeenCalledWith({
      kind: content_page_kind.POLICY,
    });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });
});
