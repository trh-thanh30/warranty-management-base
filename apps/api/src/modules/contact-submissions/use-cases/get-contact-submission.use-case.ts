import { NotFoundError } from '@/common/response';
import { Injectable } from '@nestjs/common';
import { ContactSubmissionsRepository } from '../repository/contact-submissions.repository';
import { toContactSubmissionResponse } from '../contact-submissions.types';

@Injectable()
export class GetContactSubmissionUseCase {
  constructor(private readonly repository: ContactSubmissionsRepository) {}

  async execute(id: string) {
    const submission = await this.repository.findById(id);

    if (!submission) {
      throw new NotFoundError('Contact submission not found');
    }

    return toContactSubmissionResponse(submission);
  }
}
