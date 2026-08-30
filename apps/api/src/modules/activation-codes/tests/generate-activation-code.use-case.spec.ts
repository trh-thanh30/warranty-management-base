import { GenerateActivationCodeUseCase } from '@/modules/activation-codes/use-cases/generate-activation-code.use-case';

describe('GenerateActivationCodeUseCase', () => {
  const useCase = new GenerateActivationCodeUseCase();

  it('generates readable activation codes', () => {
    expect(useCase.execute()).toMatch(/^SP-[A-HJ-NP-Z2-9]{16}$/);
  });

  it('generates a unique batch of the requested size', () => {
    const codes = useCase.executeBatch(1000);
    expect(codes).toHaveLength(1000);
    expect(new Set(codes).size).toBe(1000);
  });
});
