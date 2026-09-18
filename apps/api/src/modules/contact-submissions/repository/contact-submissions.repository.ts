import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import type {
  ContactConsultationTopic,
  ContactSubmissionStatus,
  ExportContactSubmissionsQuery,
  ListContactSubmissionsQuery,
} from '@repo/shared';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ContactSubmissionRecord } from '../contact-submissions.types';

@Injectable()
export class ContactSubmissionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(input: CreateContactSubmissionData) {
    return this.prismaService.contactSubmission.create({
      data: input,
    }) as Promise<ContactSubmissionRecord>;
  }

  findById(id: string) {
    return this.prismaService.contactSubmission.findUnique({
      where: { id },
    }) as Promise<ContactSubmissionRecord | null>;
  }

  list(query: ListContactSubmissionsQuery) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where = buildContactSubmissionWhere(query);

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.contactSubmission.findMany({
          where,
          orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
          skip,
          take,
        }),
        tx.contactSubmission.count({ where }),
      ]);

      return paginate(items as ContactSubmissionRecord[], {
        page,
        limit,
        total,
      });
    });
  }

  listForExport(query: ExportContactSubmissionsQuery) {
    return this.prismaService.contactSubmission.findMany({
      where: buildContactSubmissionWhere(query),
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    }) as Promise<ContactSubmissionRecord[]>;
  }

  updateStatus(
    id: string,
    expectedStatus: ContactSubmissionStatus,
    status: ContactSubmissionStatus,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const result = await tx.contactSubmission.updateMany({
        where: {
          id,
          status: expectedStatus,
        },
        data: { status },
      });

      if (result.count === 0) {
        return null;
      }

      return tx.contactSubmission.findUnique({
        where: { id },
      });
    });
  }
}

function buildContactSubmissionWhere(
  query: ExportContactSubmissionsQuery,
): Prisma.ContactSubmissionWhereInput {
  const search = query.search?.trim();
  return {
    status: query.status ?? { not: 'ARCHIVED' },
    OR: search
      ? [
          { full_name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { source_path: { contains: search, mode: 'insensitive' } },
        ]
      : undefined,
  };
}

export type CreateContactSubmissionData = {
  consultation_topic: ContactConsultationTopic;
  content: string;
  full_name: string;
  phone: string;
  province_code: string;
  province_name: string;
  source_path: string | null;
};
