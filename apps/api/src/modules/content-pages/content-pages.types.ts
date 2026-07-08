import { ContentPage } from '@prisma/client';

export function toContentPageResponse(page: ContentPage) {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    summary: page.summary,
    content: page.content,
    kind: page.kind,
    status: page.status,
    publishedAt: page.published_at,
    createdAt: page.created_at,
    updatedAt: page.updated_at,
  };
}
