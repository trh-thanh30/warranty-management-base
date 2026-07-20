import { extractMediaUrls, getRemovedMediaUrls } from '@repo/shared/utils';

describe('content page asset utilities', () => {
  it('extracts unique image and video source URLs', () => {
    expect(
      extractMediaUrls(`
        <img src="https://cdn.example.com/image.jpg">
        <video src='https://cdn.example.com/video.mp4'></video>
        <img src="https://cdn.example.com/image.jpg">
      `),
    ).toEqual([
      'https://cdn.example.com/image.jpg',
      'https://cdn.example.com/video.mp4',
    ]);
  });

  it('returns only media removed from the next content', () => {
    expect(
      getRemovedMediaUrls(
        '<img src="old.jpg"><img src="kept.jpg">',
        '<img src="kept.jpg">',
      ),
    ).toEqual(['old.jpg']);
  });
});
