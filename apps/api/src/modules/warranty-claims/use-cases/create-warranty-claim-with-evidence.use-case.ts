import { FileValidatorService } from '@/modules/assets/services/file-validator.service';
import {
  UploadAssetService,
  type UploadResult,
} from '@/modules/assets/services/upload-asset.service';
import { CreateWarrantyClaimDto } from '@/modules/warranty-claims/dto/create-warranty-claim.dto';
import { CreateWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim.use-case';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

const WARRANTY_CLAIM_EVIDENCE_FOLDER = 'warranty-claims/evidence';

@Injectable()
export class CreateWarrantyClaimWithEvidenceUseCase {
  constructor(
    private readonly createWarrantyClaimUseCase: CreateWarrantyClaimUseCase,
    private readonly uploadAssetService: UploadAssetService,
    private readonly fileValidatorService: FileValidatorService,
  ) {}

  async execute(
    dto: CreateWarrantyClaimDto,
    files: Express.Multer.File[],
    context: { requireOwnerMatch?: boolean; uploadedById?: string } = {},
  ) {
    files.forEach((file) =>
      this.fileValidatorService.validateFeedbackFile(file),
    );
    const uploaded: UploadResult[] = [];

    try {
      for (const file of files) {
        uploaded.push(
          await this.uploadAssetService.upload(file, {
            accessType: 'PUBLIC',
            folder: WARRANTY_CLAIM_EVIDENCE_FOLDER,
          }),
        );
      }

      return await this.createWarrantyClaimUseCase.execute(dto, {
        attachments: uploaded.map((attachment) => ({
          ...attachment,
          accessType: 'PUBLIC' as const,
          folder: WARRANTY_CLAIM_EVIDENCE_FOLDER,
          id: randomUUID(),
          uploadedById: context.uploadedById,
        })),
        requireOwnerMatch: context.requireOwnerMatch,
      });
    } catch (error) {
      await Promise.allSettled(
        uploaded.map((attachment) =>
          this.uploadAssetService.delete(attachment.path),
        ),
      );
      throw error;
    }
  }
}
