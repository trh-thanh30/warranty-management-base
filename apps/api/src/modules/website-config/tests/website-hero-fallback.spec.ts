import { DEFAULT_HOME_HERO_SLIDES } from '@repo/shared/constants';
import { resolveWebsiteHeroSlides } from '@repo/shared/utils';

describe('website hero fallback', () => {
  it('uses the shared desktop and mobile defaults without published config', () => {
    expect(resolveWebsiteHeroSlides([])).toEqual({
      desktop: DEFAULT_HOME_HERO_SLIDES.map((slide) => ({
        id: slide.id,
        key: slide.key,
        sortOrder: slide.sortOrder,
        url: slide.desktopUrl,
      })),
      mobile: DEFAULT_HOME_HERO_SLIDES.map((slide) => ({
        id: slide.id,
        key: slide.key,
        sortOrder: slide.sortOrder,
        url: slide.mobileUrl,
      })),
    });
  });

  it('keeps desktop-only custom slides out of the mobile carousel', () => {
    expect(
      resolveWebsiteHeroSlides([
        {
          desktopImage: {
            id: 'asset-desktop',
            mimeType: 'image/jpeg',
            url: 'https://cdn.example.com/desktop.jpg',
          },
          id: 'custom-slide',
          isActive: true,
          key: 'custom-slide',
          mobileImage: null,
          sortOrder: 0,
        },
      ]),
    ).toEqual({
      desktop: [
        {
          id: 'custom-slide',
          key: 'custom-slide',
          sortOrder: 0,
          url: 'https://cdn.example.com/desktop.jpg',
        },
      ],
      mobile: DEFAULT_HOME_HERO_SLIDES.map((slide) => ({
        id: slide.id,
        key: slide.key,
        sortOrder: slide.sortOrder,
        url: slide.mobileUrl,
      })),
    });
  });

  it('keeps mobile-only custom slides out of the desktop carousel', () => {
    expect(
      resolveWebsiteHeroSlides([
        {
          desktopImage: null,
          id: 'custom-slide',
          isActive: true,
          key: 'custom-slide',
          mobileImage: {
            id: 'asset-mobile',
            mimeType: 'image/jpeg',
            url: 'https://cdn.example.com/mobile.jpg',
          },
          sortOrder: 0,
        },
      ]),
    ).toEqual({
      desktop: DEFAULT_HOME_HERO_SLIDES.map((slide) => ({
        id: slide.id,
        key: slide.key,
        sortOrder: slide.sortOrder,
        url: slide.desktopUrl,
      })),
      mobile: [
        {
          id: 'custom-slide',
          key: 'custom-slide',
          sortOrder: 0,
          url: 'https://cdn.example.com/mobile.jpg',
        },
      ],
    });
  });
});
