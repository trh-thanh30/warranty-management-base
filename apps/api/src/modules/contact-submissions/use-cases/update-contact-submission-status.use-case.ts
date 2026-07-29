import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import type { UpdateContactSubmissionStatusBody } from '@repo/shared';
import { getAllowedContactSubmissionTransitions } from '@repo/shared/constants';
import { Injectable } from '@nestjs/common';
import { ContactSubmissionsRepository } from '../repository/contact-submissions.repository';
import { toContactSubmissionResponse } from '../contact-submissions.types';

@Injectable()
export class UpdateContactSubmissionStatusUseCase {
  constructor(private readonly repository: ContactSubmissionsRepository) {}

  async execute(id: string, input: UpdateContactSubmissionStatusBody) {
    const current = await this.repository.findById(id);

    if (!current) {
      throw new NotFoundError('Contact submission not found');
    }

    if (current.status === input.status) {
      return toContactSubmissionResponse(current);
    }

    const allowedTransitions = getAllowedContactSubmissionTransitions(
      current.status,
    );
    if (!allowedTransitions.includes(input.status)) {
      throw new BadRequestError(
        'Contact submission status transition is invalid',
        'CONTACT_SUBMISSION_STATUS_TRANSITION_INVALID',
        {
          allowedTransitions,
          currentStatus: current.status,
          requestedStatus: input.status,
        },
      );
    }

    const updated = await this.repository.updateStatus(
      id,
      current.status,
      input.status,
    );

    if (!updated) {
      throw new ConflictError(
        'Contact submission status was changed by another request',
        'CONTACT_SUBMISSION_STATUS_CONFLICT',
        {
          expectedStatus: current.status,
          requestedStatus: input.status,
        },
      );
    }

    return toContactSubmissionResponse(updated);
  }
}
