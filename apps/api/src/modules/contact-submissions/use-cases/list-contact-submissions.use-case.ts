import type {
  ListContactSubmissionsQuery,
  ListContactSubmissionsResponse,
} from '@repo/shared';
import { Injectable } from '@nestjs/common';
import { ContactSubmissionsRepository } from '../repository/contact-submissions.repository';
import { toContactSubmissionResponse } from '../contact-submissions.types';

@Injectable()
export class ListContactSubmissionsUseCase {
  constructor(private readonly repository: ContactSubmissionsRepository) {}

  async execute(
    query: ListContactSubmissionsQuery,
  ): Promise<ListContactSubmissionsResponse> {
    const result = await this.repository.list({
      ...query,
      search: query.search?.trim() || undefined,
    });

    return {
      items: result.items.map(toContactSubmissionResponse),
      meta: result.meta,
    };
  }
}
