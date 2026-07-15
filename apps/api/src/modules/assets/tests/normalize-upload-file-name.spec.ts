import { normalizeUploadFileName } from '@/modules/assets/utils/file-name.utils';

describe('normalizeUploadFileName', () => {
  it('restores a UTF-8 file name decoded as Latin-1 by multipart parsing', () => {
    expect(normalizeUploadFileName('Phiáº¿u báº£o hÃ nh.pdf')).toBe(
      'Phiếu bảo hành.pdf',
    );
  });

  it('keeps ASCII and correctly decoded Unicode file names unchanged', () => {
    expect(normalizeUploadFileName('invoice-2026.pdf')).toBe(
      'invoice-2026.pdf',
    );
    expect(normalizeUploadFileName('Phiếu bảo hành.pdf')).toBe(
      'Phiếu bảo hành.pdf',
    );
  });
});
