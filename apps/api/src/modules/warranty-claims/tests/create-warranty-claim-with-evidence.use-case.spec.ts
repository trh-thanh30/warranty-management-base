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

  it('creates a warranty claim without evidence when no files are provided', async () => {
    const createWarrantyClaimUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'claim-id' }),
    };
    const uploadAssetService = { delete: jest.fn(), upload: jest.fn() };
    const fileValidatorService = { validateFeedbackFile: jest.fn() };
    const useCase = new CreateWarrantyClaimWithEvidenceUseCase(
      createWarrantyClaimUseCase as never,
      uploadAssetService as never,
      fileValidatorService as never,
    );

    await expect(useCase.execute({} as never, [])).resolves.toEqual({
      id: 'claim-id',
    });
    expect(createWarrantyClaimUseCase.execute).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ attachments: [] }),
    );
    expect(uploadAssetService.upload).not.toHaveBeenCalled();
    expect(fileValidatorService.validateFeedbackFile).not.toHaveBeenCalled();
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
