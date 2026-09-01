import {
  ACTIVATION_LABELS_PER_PAGE,
  ActivationLabelTemplateService,
} from '@/modules/activation-codes/services/activation-label-template.service';

describe('ActivationLabelTemplateService', () => {
  const service = new ActivationLabelTemplateService();
  const batch = {
    productName: 'Camera hành trình',
    productSku: 'SKU-001',
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
});
