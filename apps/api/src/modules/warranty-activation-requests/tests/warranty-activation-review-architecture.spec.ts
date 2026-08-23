import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Warranty activation review architecture', () => {
  it('keeps activation decisions in the review use case', () => {
    const repositorySource = readFileSync(
      join(
        __dirname,
        '../repository/warranty-activation-requests.repository.ts',
      ),
      'utf8',
    );
    const useCaseSource = readFileSync(
      join(
        __dirname,
        '../use-cases/review-warranty-activation-request.use-case.ts',
      ),
      'utf8',
    );

    expect(repositorySource).not.toContain('BadRequestError');
    expect(repositorySource).not.toContain('product_status');
    expect(repositorySource).not.toContain('warranty_status');
    expect(useCaseSource).toContain('WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION');
    expect(useCaseSource).toContain('CUSTOMER_IDENTITY_CONFLICT');
  });
});
