import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Warranty activation review architecture', () => {
  it('encapsulates repository queries in an injectable class', () => {
    const queriesSource = readFileSync(
      join(
        __dirname,
        '../repository/warranty-activation-requests.repository.queries.ts',
      ),
      'utf8',
    );

    expect(queriesSource).toContain('@Injectable()');
    expect(queriesSource).toContain('class WarrantyActivationRequestQueries');
    expect(queriesSource).not.toContain('export function');
    expect(queriesSource).not.toContain('export const');
  });

  it('keeps activation decisions in the review use case', () => {
    const repositorySource = [
      '../repository/warranty-activation-requests.repository.ts',
      '../repository/warranty-activation-review-transaction.repository.ts',
    ]
      .map((path) => readFileSync(join(__dirname, path), 'utf8'))
      .join('\n');
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
