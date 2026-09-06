import {
  ACTIVATION_LABELS_PER_PAGE,
  ActivationLabelTemplateService,
} from '@/modules/activation-codes/services/activation-label-template.service';

describe('ActivationLabelTemplateService', () => {
  const service = new ActivationLabelTemplateService();
  const batch = {
    productName: 'Camera hành trình',
    expiresAt: new Date('2027-02-28T00:00:00Z'),
  };

  it.each([
    [1, 1],
    [ACTIVATION_LABELS_PER_PAGE, 1],
    [ACTIVATION_LABELS_PER_PAGE + 1, 2],
    [1000, 16],
  ])('creates %s labels across %s A4 sheets', (count, pages) => {
    const html = service.render(
      batch,
      Array.from({ length: count }, (_, i) => `SP-${i}`),
    );
    expect(html.match(/class="sheet"/g) ?? []).toHaveLength(pages);
    expect(html.match(/class="label"/g) ?? []).toHaveLength(count);
  });

  it('keeps the default 45.7 x 16.9 mm layout at 64 labels per sheet', () => {
    const html = service.render(batch, ['SP-1']);

    expect(html).toContain('grid-template-columns:repeat(4,45.7mm)');
    expect(html).toContain('grid-template-rows:repeat(16,16.9mm)');
    expect(html).toContain('.label{width:45.7mm;height:16.9mm');
    expect(html).not.toContain('SKU:');
  });

  it('uses a custom label size and recalculates labels per A4 sheet', () => {
    const html = service.render(
      batch,
      Array.from({ length: 53 }, (_, i) => `SP-${i}`),
      { labelHeightMm: 20, labelWidthMm: 40 },
    );

    expect(html.match(/class="sheet"/g) ?? []).toHaveLength(2);
    expect(html).toContain('grid-template-columns:repeat(4,40mm)');
    expect(html).toContain('grid-template-rows:repeat(13,20mm)');
    expect(html).toContain('.label{width:40mm;height:20mm');
  });
});
