import type { AssetsService } from '@/modules/assets/assets.service';
import type {
  WebsiteConfigRepository,
  WebsiteSiteRevisionRecord,
} from '@/modules/website-config/repository/website-config.repository';
import type { WebsiteConfigPolicyService } from '@/modules/website-config/service/website-config-policy.service';
import { WebsiteSiteConfigUseCase } from '@/modules/website-config/use-cases/website-site-config.use-case';
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from '@repo/shared/constants';

describe('WebsiteSiteConfigUseCase', () => {
  it('keeps the public homepage unchanged until the draft is published', async () => {
    const draft = revisionWithTitle('Draft title');
    const published = revisionWithTitle('Published title');
    const repository = {
      findSitePublished: jest.fn().mockResolvedValue(published),
      getOrCreateSiteDraft: jest.fn().mockResolvedValue(draft),
    };
    const useCase = new WebsiteSiteConfigUseCase(
      repository as unknown as WebsiteConfigRepository,
      {} as WebsiteConfigPolicyService,
      {} as AssetsService,
    );

    const result = await useCase.getPublic('vi');

    expect(result.homepage.copy.landing.hero.titlePrefix.content).toBe(
      'Published title',
    );
    expect(repository.getOrCreateSiteDraft).not.toHaveBeenCalled();
  });
});

function revisionWithTitle(title: string): WebsiteSiteRevisionRecord {
  const homepageContent = structuredClone(DEFAULT_WEBSITE_HOMEPAGE_CONTENT);
  homepageContent.vi.landing.hero.titlePrefix.content = title;

  return {
    contact_email: '',
    footer_logo: null,
    header_logo: null,
    hero_slides: [],
    homepage_about_image: null,
    homepage_content: homepageContent,
    homepage_sputter_chamber_image: null,
    homepage_sputter_structure_image: null,
    offices: [],
    og_image: null,
    revision_number: 1,
    social_links: [],
    updated_at: new Date('2026-09-10T00:00:00.000Z'),
    website_url: '',
  } as unknown as WebsiteSiteRevisionRecord;
}
