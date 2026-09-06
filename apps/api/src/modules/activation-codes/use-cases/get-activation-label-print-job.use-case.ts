import { NotFoundError } from '@/common/response';
import { ActivationCodePrintJobsRepository } from '@/modules/activation-codes/repository/activation-code-print-jobs.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetActivationLabelPrintJobUseCase {
  constructor(private readonly jobs: ActivationCodePrintJobsRepository) {}

  async execute(id: string) {
    const job = await this.jobs.findById(id);
    if (!job) throw new NotFoundError('Activation label print job not found');
    return job;
  }
}
