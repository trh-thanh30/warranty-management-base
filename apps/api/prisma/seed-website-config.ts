import { PrismaClient, website_revision_state } from '@prisma/client';

/**
 * Creates structurally valid, unpublished drafts without replacing editor data.
 * Safe to run repeatedly in development, test, and production seeds.
 */
export async function seedWebsiteConfigDrafts(client: PrismaClient) {
  await client.$transaction(async (tx) => {
    const site = await tx.websiteSiteRevision.findFirst({
      where: { site_key: 'main', state: website_revision_state.DRAFT },
    });

    if (!site) {
      await tx.websiteSiteRevision.create({
        data: {
          site_key: 'main',
          state: website_revision_state.DRAFT,
        },
      });
    }
  });
}
