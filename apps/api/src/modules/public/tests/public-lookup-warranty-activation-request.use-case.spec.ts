import { PublicLookupWarrantyActivationRequestUseCase } from '@/modules/public/use-cases/public-lookup-warranty-activation-request.use-case';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Test, type TestingModule } from '@nestjs/testing';

describe('PublicLookupWarrantyActivationRequestUseCase', () => {
  const repository = {
    findPublicStatusByRequestCode: jest.fn(),
  };
  let module: TestingModule;
  let useCase: PublicLookupWarrantyActivationRequestUseCase;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        PublicLookupWarrantyActivationRequestUseCase,
        {
          provide: WarrantyActivationRequestsRepository,
          useValue: repository,
        },
      ],
    }).compile();
    useCase = module.get(PublicLookupWarrantyActivationRequestUseCase);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns only the public status fields for a normalized WAR code', async () => {
    repository.findPublicStatusByRequestCode.mockResolvedValue({
      request_code: 'WAR-20260907-0001',
      status: 'PENDING',
      created_at: new Date('2026-09-07T01:00:00.000Z'),
      reviewed_at: null,
      updated_at: new Date('2026-09-07T01:00:00.000Z'),
    });

    await expect(useCase.execute(' war-20260907-0001 ')).resolves.toEqual({
      requestCode: 'WAR-20260907-0001',
      status: 'PENDING',
      createdAt: '2026-09-07T01:00:00.000Z',
      reviewedAt: null,
      updatedAt: '2026-09-07T01:00:00.000Z',
    });
    expect(repository.findPublicStatusByRequestCode).toHaveBeenCalledWith(
      'WAR-20260907-0001',
    );
  });

  it('rejects malformed request codes without querying storage', async () => {
    await expect(useCase.execute('WAR-INVALID')).rejects.toMatchObject({
      code: 'WARRANTY_ACTIVATION_REQUEST_CODE_INVALID',
      statusCode: 400,
    });
    expect(repository.findPublicStatusByRequestCode).not.toHaveBeenCalled();
  });

  it('returns not found without exposing whether another identifier exists', async () => {
    repository.findPublicStatusByRequestCode.mockResolvedValue(null);

    await expect(useCase.execute('WAR-20260907-9999')).rejects.toMatchObject({
      code: 'WARRANTY_ACTIVATION_REQUEST_NOT_FOUND',
      statusCode: 404,
    });
  });
});
