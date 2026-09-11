import { CreateWarrantyClaimWithEvidenceUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim-with-evidence.use-case';

describe('CreateWarrantyClaimWithEvidenceUseCase', () => {
  const uploadResult = {
    filename: 'stored.webp',
    mimeType: 'image/webp',
    originalName: 'damage.webp',
    path: 'public/warranty-claims/evidence/stored.webp',
    size: 5,
    type: 'IMAGE',
  };

  it('validates, uploads and atomically passes evidence into claim creation', async () => {
    const createWarrantyClaimUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'claim-id' }),
    };
    const uploadAssetService = {
      delete: jest.fn(),
      upload: jest.fn().mockResolvedValue(uploadResult),
    };
    const fileValidatorService = { validateFeedbackFile: jest.fn() };
    const useCase = new CreateWarrantyClaimWithEvidenceUseCase(
      createWarrantyClaimUseCase as never,
      uploadAssetService as never,
      fileValidatorService as never,
    );
    const file = { mimetype: 'image/webp' } as Express.Multer.File;

    await useCase.execute({} as never, [file], {
      requireOwnerMatch: true,
      uploadedById: 'admin-id',
    });

    expect(fileValidatorService.validateFeedbackFile).toHaveBeenCalledWith(
      file,
    );
    expect(createWarrantyClaimUseCase.execute).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            filename: uploadResult.filename,
            uploadedById: 'admin-id',
          }),
        ],
        requireOwnerMatch: true,
      }),
    );
  });

  it('requires at least one image or video', async () => {
    const useCase = new CreateWarrantyClaimWithEvidenceUseCase(
      { execute: jest.fn() } as never,
      { delete: jest.fn(), upload: jest.fn() } as never,
      { validateFeedbackFile: jest.fn() } as never,
    );

    await expect(useCase.execute({} as never, [])).rejects.toMatchObject({
      details: { code: 'WARRANTY_CLAIM_EVIDENCE_REQUIRED' },
      statusCode: 400,
    });
  });

  it('removes uploaded objects when claim creation fails', async () => {
    const uploadAssetService = {
      delete: jest.fn().mockResolvedValue(undefined),
      upload: jest.fn().mockResolvedValue(uploadResult),
    };
    const useCase = new CreateWarrantyClaimWithEvidenceUseCase(
      {
        execute: jest.fn().mockRejectedValue(new Error('create failed')),
      } as never,
      uploadAssetService as never,
      { validateFeedbackFile: jest.fn() } as never,
    );

    await expect(
      useCase.execute({} as never, [
        { mimetype: 'image/webp' } as Express.Multer.File,
      ]),
    ).rejects.toThrow('create failed');
    expect(uploadAssetService.delete).toHaveBeenCalledWith(uploadResult.path);
  });
});
