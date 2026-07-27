import { Category, ContentPage, ContentPageFaqItem } from '@prisma/client';

export function toContentPageResponse(
  page: ContentPage & {
    category?: Category | null;
    faq_items?: ContentPageFaqItem[];
  },
) {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    summary: page.summary,
    content: page.content,
    faqItems: (page.faq_items ?? []).map(toContentPageFaqItemResponse),
    kind: page.kind,
    categoryId: page.category_id,
    categoryRef: page.category ? toCategorySummary(page.category) : null,
    status: page.status,
    publishedAt: page.published_at,
    createdAt: page.created_at,
    updatedAt: page.updated_at,
  };
}

export function toContentPageFaqItemResponse(item: ContentPageFaqItem) {
  return {
    id: item.id,
    question: item.question,
    answer: item.answer,
    sortOrder: item.sort_order,
    isActive: item.is_active,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function toCategorySummary(category: Category) {
  return {
    id: category.id,
    type: category.type,
    code: category.code,
    slug: category.slug,
    name: category.name,
    description: category.description,
    parentId: category.parent_id,
    icon: category.icon,
    imageUrl: category.image_url,
    order: category.order,
    isActive: category.is_active,
    metadata: category.metadata as Record<string, unknown> | null,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  };
}
