import { ConflictError, NotFoundError } from '@/common/response';
import { DeleteContentPageUseCase } from '@/modules/content-pages/use-cases/delete-content-page.use-case';
import { CreateContentPageUseCase } from '@/modules/content-pages/use-cases/create-content-page.use-case';
import { GetPublishedContentPageBySlugUseCase } from '@/modules/content-pages/use-cases/get-published-content-page-by-slug.use-case';
import { ListPublishedContentPagesUseCase } from '@/modules/content-pages/use-cases/list-published-content-pages.use-case';
import { UpdateContentPageUseCase } from '@/modules/content-pages/use-cases/update-content-page.use-case';
import { ReorderContentPageFaqItemsUseCase } from '@/modules/content-pages/use-cases/reorder-content-page-faq-items.use-case';
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
  faq_items: [],
  kind: content_page_kind.GENERAL_POLICY,
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
    reorderFaqItems: jest.fn(),
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

  it('creates ordered structured FAQ items', async () => {
    contentPagesRepository.findBySlug.mockResolvedValue(null);
    contentPagesRepository.create.mockResolvedValue({
      ...page,
      content: '',
      kind: content_page_kind.FAQ,
      faq_items: [
        {
          id: 'faq-0',
          content_page_id: page.id,
          question: 'Câu hỏi thứ nhất?',
          answer: '<p>Câu trả lời.</p>',
          sort_order: 0,
          is_active: true,
          created_at: page.created_at,
          updated_at: page.updated_at,
        },
      ],
    });
    const useCase = new CreateContentPageUseCase(
      contentPagesRepository as never,
    );

    const result = await useCase.execute({
      slug: 'cau-hoi-thuong-gap',
      title: 'Câu hỏi thường gặp',
      kind: content_page_kind.FAQ,
      status: content_page_status.PUBLISHED,
      faqItems: [
        {
          question: ' Câu hỏi thứ nhất? ',
          answer: ' <p>Câu trả lời.</p> ',
          isActive: true,
        },
      ],
    });

    expect(contentPagesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '',
        faq_items: {
          create: [
            {
              answer: '<p>Câu trả lời.</p>',
              is_active: true,
              question: 'Câu hỏi thứ nhất?',
              sort_order: 0,
            },
          ],
        },
      }),
    );
    expect(result.faqItems).toHaveLength(1);
    expect(result.faqItems[0].question).toBe('Câu hỏi thứ nhất?');
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
      kind: content_page_kind.GENERAL_POLICY,
    });

    expect(contentPagesRepository.listPublished).toHaveBeenCalledWith({
      kind: content_page_kind.GENERAL_POLICY,
    });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('reorders every FAQ item through the dedicated repository operation', async () => {
    const firstItem = {
      id: '1c4dfd2c-46e4-49db-a5f4-ffef569712c4',
      content_page_id: page.id,
      question: 'Câu hỏi 1',
      answer: '<p>Trả lời 1</p>',
      sort_order: 0,
      is_active: true,
      created_at: page.created_at,
      updated_at: page.updated_at,
    };
    const secondItem = {
      ...firstItem,
      id: 'c6a95189-721a-4c98-a8c6-cf0db911489b',
      question: 'Câu hỏi 2',
      sort_order: 1,
    };
    const faqPage = {
      ...page,
      kind: content_page_kind.FAQ,
      faq_items: [firstItem, secondItem],
    };
    contentPagesRepository.findById.mockResolvedValue(faqPage);
    contentPagesRepository.reorderFaqItems.mockResolvedValue({
      ...faqPage,
      faq_items: [
        { ...secondItem, sort_order: 0 },
        { ...firstItem, sort_order: 1 },
      ],
    });
    const useCase = new ReorderContentPageFaqItemsUseCase(
      contentPagesRepository as never,
    );

    const itemIds = [secondItem.id, firstItem.id];
    const result = await useCase.execute(page.id, { itemIds });

    expect(contentPagesRepository.reorderFaqItems).toHaveBeenCalledWith(
      page.id,
      itemIds,
    );
    expect(result.faqItems.map((item) => item.id)).toEqual(itemIds);
  });
});
