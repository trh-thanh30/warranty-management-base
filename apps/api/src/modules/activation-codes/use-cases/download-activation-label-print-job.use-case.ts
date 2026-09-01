import { NotFoundError } from '@/common/response';
import { ActivationCodePrintJobsRepository } from '@/modules/activation-codes/repository/activation-code-print-jobs.repository';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadActivationLabelPrintJobUseCase {
  constructor(
    private readonly jobs: ActivationCodePrintJobsRepository,
    private readonly assets: UploadAssetService,
  ) {}

  async execute(id: string) {
    const job = await this.jobs.findById(id);
    if (!job || job.status !== 'COMPLETED' || !job.storage_key) {
      throw new NotFoundError('Completed activation label PDF not found');
    }
    return {
      filename: job.filename ?? `${job.batch.batch_code}-labels.pdf`,
      stream: await this.assets.getStream(job.storage_key),
    };
  }
}
