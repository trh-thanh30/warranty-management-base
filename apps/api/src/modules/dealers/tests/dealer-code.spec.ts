import { GenerateDealerCodeUseCase } from '@/modules/dealers/use-cases/generate-dealer-code.use-case';

const generateDealerCode = () => new GenerateDealerCodeUseCase().execute();

describe('generateDealerCode', () => {
  it('generates a human-friendly dealer code', () => {
    expect(generateDealerCode()).toMatch(/^DLR-[A-HJ-NP-Z2-9]{8}$/);
  });

  it('does not generate duplicates in a representative batch', () => {
    const codes = Array.from({ length: 1_000 }, generateDealerCode);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
