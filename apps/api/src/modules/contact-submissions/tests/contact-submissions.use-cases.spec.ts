import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { CreateContactSubmissionUseCase } from '@/modules/contact-submissions/use-cases/create-contact-submission.use-case';
import { GetContactSubmissionUseCase } from '@/modules/contact-submissions/use-cases/get-contact-submission.use-case';
import { ListContactSubmissionsUseCase } from '@/modules/contact-submissions/use-cases/list-contact-submissions.use-case';
import { ContactSubmissionsRepository } from '@/modules/contact-submissions/repository/contact-submissions.repository';
import { ContactSubmissionNotificationService } from '@/modules/contact-submissions/service/contact-submission-notification.service';
import { UpdateContactSubmissionStatusUseCase } from '@/modules/contact-submissions/use-cases/update-contact-submission-status.use-case';
import { NOTIFICATION_TYPES } from '@repo/shared/constants';
import { notification_scope, Prisma, user_role } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const baseSubmission = {
  id: 'contact-submission-id',
  full_name: 'Nguyen Van A',
  phone: '0886337733',
  content: 'Toi can tu van phim cach nhiet cho xe.',
  consultation_topic: 'PRODUCT_CONSULTATION' as const,
  province_code: '79',
  province_name: 'Thành phố Hồ Chí Minh',
  status: 'NEW' as const,
  source_path: '/vi/lien-he',
  created_at: new Date('2026-07-28T00:00:00.000Z'),
  updated_at: new Date('2026-07-28T00:00:00.000Z'),
};

type ContactSubmissionTransactionMock = {
  contactSubmission: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    updateMany: jest.Mock;
  };
};

function createPrismaServiceMock(client: ContactSubmissionTransactionMock) {
  return {
    $transaction: jest.fn(
      <T>(callback: (tx: ContactSubmissionTransactionMock) => Promise<T>) =>
        callback(client),
    ),
  };
}

describe('Contact submission use cases', () => {
  const repository = {
    create: jest.fn(),
    findPendingByPhone: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    updateStatus: jest.fn(),
  };
  const getVietnamProvinceUseCase = {
    execute: jest.fn(),
  };
  const contactSubmissionNotificationService = {
    submissionCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getVietnamProvinceUseCase.execute.mockResolvedValue({
      code: 79,
      name: ' Thành phố Hồ Chí Minh ',
    });
    contactSubmissionNotificationService.submissionCreated.mockResolvedValue(
      undefined,
    );
  });

  function createSubmissionUseCase() {
    return new CreateContactSubmissionUseCase(
      repository as never,
      getVietnamProvinceUseCase as never,
      contactSubmissionNotificationService as never,
    );
  }

  it('creates a contact submission with the canonical province returned by Locations', async () => {
    repository.findPendingByPhone.mockResolvedValue(null);
    repository.create.mockResolvedValue(baseSubmission);
    const useCase = createSubmissionUseCase();

    const result = await useCase.execute({
      consultationTopic: 'PRODUCT_CONSULTATION',
      content: ' Toi can tu van phim cach nhiet cho xe. ',
      fullName: ' Nguyen Van A ',
      phone: ' 0886 33 77 33 ',
      provinceCode: ' 79 ',
      sourcePath: ' /vi/lien-he ',
    });

    expect(getVietnamProvinceUseCase.execute).toHaveBeenCalledWith(79, 1);
    expect(repository.create).toHaveBeenCalledWith({
      consultation_topic: 'PRODUCT_CONSULTATION',
      content: 'Toi can tu van phim cach nhiet cho xe.',
      full_name: 'Nguyen Van A',
      phone: '0886337733',
      province_code: '79',
      province_name: 'Thành phố Hồ Chí Minh',
      source_path: '/vi/lien-he',
    });
    expect(
      contactSubmissionNotificationService.submissionCreated,
    ).toHaveBeenCalledWith(baseSubmission);
    expect(result).toMatchObject({
      consultationTopic: 'PRODUCT_CONSULTATION',
      content: 'Toi can tu van phim cach nhiet cho xe.',
      fullName: 'Nguyen Van A',
      phone: '0886337733',
      provinceCode: '79',
      provinceName: 'Thành phố Hồ Chí Minh',
      sourcePath: '/vi/lien-he',
      status: 'NEW',
    });
  });

  it('rejects a non-numeric province code before creating a submission', async () => {
    const useCase = createSubmissionUseCase();

    await expect(
      useCase.execute({
        consultationTopic: 'PRODUCT_CONSULTATION',
        content: 'Toi can tu van phim cach nhiet cho xe.',
        fullName: 'Nguyen Van A',
        phone: '0886337733',
        provinceCode: '79abc',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);

    expect(getVietnamProvinceUseCase.execute).not.toHaveBeenCalled();
    expect(repository.findPendingByPhone).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(
      contactSubmissionNotificationService.submissionCreated,
    ).not.toHaveBeenCalled();
  });

  it('rejects a contact submission when the normalized phone already has a pending message', async () => {
    repository.findPendingByPhone.mockResolvedValue(baseSubmission);
    const useCase = createSubmissionUseCase();

    await expect(
      useCase.execute({
        consultationTopic: 'PRODUCT_CONSULTATION',
        content: 'Toi can tu van phim cach nhiet cho xe.',
        fullName: 'Nguyen Van A',
        phone: ' 0886 33 77 33 ',
        provinceCode: '79',
      }),
    ).rejects.toMatchObject<Partial<ConflictError>>({
      code: 'CONTACT_SUBMISSION_PHONE_PENDING',
    });
    expect(repository.findPendingByPhone).toHaveBeenCalledWith('0886337733');
    expect(repository.create).not.toHaveBeenCalled();
    expect(
      contactSubmissionNotificationService.submissionCreated,
    ).not.toHaveBeenCalled();
  });

  it('maps a concurrent pending-phone unique collision to the domain conflict', async () => {
    repository.findPendingByPhone.mockResolvedValue(null);
    repository.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        clientVersion: 'test',
        code: 'P2002',
        meta: { target: ['phone'] },
      }),
    );
    const useCase = createSubmissionUseCase();

    await expect(
      useCase.execute({
        consultationTopic: 'PRODUCT_CONSULTATION',
        content: 'Toi can tu van phim cach nhiet cho xe.',
        fullName: 'Nguyen Van A',
        phone: '0886 33 77 33',
        provinceCode: '79',
      }),
    ).rejects.toMatchObject<Partial<ConflictError>>({
      code: 'CONTACT_SUBMISSION_PHONE_PENDING',
      details: { phone: '0886337733' },
    });
    expect(
      contactSubmissionNotificationService.submissionCreated,
    ).not.toHaveBeenCalled();
  });

  it('rejects too-short contact message content', async () => {
    const useCase = createSubmissionUseCase();

    await expect(
      useCase.execute({
        consultationTopic: 'PRODUCT_CONSULTATION',
        content: 'short',
        fullName: 'Nguyen Van A',
        phone: '0886337733',
        provinceCode: '79',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(repository.findPendingByPhone).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(
      contactSubmissionNotificationService.submissionCreated,
    ).not.toHaveBeenCalled();
  });

  it('lists contact submissions with pagination and filters', async () => {
    repository.list.mockResolvedValue({
      items: [baseSubmission],
      meta: {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 20,
        page: 1,
        total: 1,
        totalPages: 1,
      },
    });
    const useCase = new ListContactSubmissionsUseCase(repository as never);

    const result = await useCase.execute({
      limit: 20,
      page: 1,
      search: ' Nguyen ',
      status: 'NEW',
    });

    expect(repository.list).toHaveBeenCalledWith({
      limit: 20,
      page: 1,
      search: 'Nguyen',
      status: 'NEW',
    });
    expect(result.items[0]).toMatchObject({
      id: 'contact-submission-id',
      fullName: 'Nguyen Van A',
      status: 'NEW',
    });
  });

  it('throws not found when contact submission detail is absent', async () => {
    repository.findById.mockResolvedValue(null);
    const useCase = new GetContactSubmissionUseCase(repository as never);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('maps an unknown stored consultation topic to null', async () => {
    repository.findById.mockResolvedValue({
      ...baseSubmission,
      consultation_topic: 'LEGACY_TOPIC',
    });
    const useCase = new GetContactSubmissionUseCase(repository as never);

    await expect(
      useCase.execute('contact-submission-id'),
    ).resolves.toMatchObject({
      consultationTopic: null,
    });
  });

  it('updates contact submission status', async () => {
    repository.findById.mockResolvedValue(baseSubmission);
    repository.updateStatus.mockResolvedValue({
      ...baseSubmission,
      status: 'IN_PROGRESS',
    });
    const useCase = new UpdateContactSubmissionStatusUseCase(
      repository as never,
    );

    const result = await useCase.execute('contact-submission-id', {
      status: 'IN_PROGRESS',
    });

    expect(repository.updateStatus).toHaveBeenCalledWith(
      'contact-submission-id',
      'NEW',
      'IN_PROGRESS',
    );
    expect(result.status).toBe('IN_PROGRESS');
  });

  it('rejects a stale status update changed by another request', async () => {
    repository.findById.mockResolvedValue(baseSubmission);
    repository.updateStatus.mockResolvedValue(null);
    const useCase = new UpdateContactSubmissionStatusUseCase(
      repository as never,
    );

    await expect(
      useCase.execute('contact-submission-id', {
        status: 'IN_PROGRESS',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repository.updateStatus).toHaveBeenCalledWith(
      'contact-submission-id',
      'NEW',
      'IN_PROGRESS',
    );
  });

  it('rejects a backward transition from archived to new', async () => {
    repository.findById.mockResolvedValue({
      ...baseSubmission,
      status: 'ARCHIVED',
    });
    const useCase = new UpdateContactSubmissionStatusUseCase(
      repository as never,
    );

    await expect(
      useCase.execute('contact-submission-id', {
        status: 'NEW',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
});

describe('Contact submission notification service', () => {
  const createSystemNotificationUseCase = {
    execute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes new submissions to active admin roles', async () => {
    createSystemNotificationUseCase.execute.mockResolvedValue(undefined);
    const service = new ContactSubmissionNotificationService(
      createSystemNotificationUseCase as never,
    );

    await service.submissionCreated(baseSubmission);

    expect(createSystemNotificationUseCase.execute).toHaveBeenCalledWith({
      content: 'A new consultation request has been submitted by Nguyen Van A.',
      metadata: {
        consultationTopic: baseSubmission.consultation_topic,
        fullName: baseSubmission.full_name,
        phone: baseSubmission.phone,
        provinceCode: baseSubmission.province_code,
        provinceName: baseSubmission.province_name,
        status: baseSubmission.status,
        submissionId: baseSubmission.id,
      },
      scope: notification_scope.ROLE,
      target_roles: [user_role.ADMIN, user_role.MODERATOR],
      title: 'New contact submission from Nguyen Van A',
      type: NOTIFICATION_TYPES.CONTACT_SUBMISSION_CREATED,
    });
  });

  it('does not fail the public request when notification publishing fails', async () => {
    createSystemNotificationUseCase.execute.mockRejectedValue(
      new Error('notification unavailable'),
    );
    const service = new ContactSubmissionNotificationService(
      createSystemNotificationUseCase as never,
    );

    await expect(
      service.submissionCreated(baseSubmission),
    ).resolves.toBeUndefined();
  });
});

describe('Contact submissions repository', () => {
  it('updates only when the persisted status still matches the expected status', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const findUnique = jest.fn().mockResolvedValue({
      ...baseSubmission,
      status: 'IN_PROGRESS',
    });
    const prismaService = createPrismaServiceMock({
      contactSubmission: {
        findFirst: jest.fn(),
        findUnique,
        updateMany,
      },
    });
    const repository = new ContactSubmissionsRepository(prismaService as never);

    const result = await repository.updateStatus(
      'contact-submission-id',
      'NEW',
      'IN_PROGRESS',
    );

    expect(updateMany).toHaveBeenCalledWith({
      data: { status: 'IN_PROGRESS' },
      where: {
        id: 'contact-submission-id',
        status: 'NEW',
      },
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'contact-submission-id' },
    });
    expect(result?.status).toBe('IN_PROGRESS');
  });

  it('returns null when another request already changed the status', async () => {
    const findUnique = jest.fn();
    const prismaService = createPrismaServiceMock({
      contactSubmission: {
        findFirst: jest.fn(),
        findUnique,
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    });
    const repository = new ContactSubmissionsRepository(prismaService as never);

    await expect(
      repository.updateStatus('contact-submission-id', 'NEW', 'IN_PROGRESS'),
    ).resolves.toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('finds pending contact submissions by normalized phone', async () => {
    const findFirst = jest.fn().mockResolvedValue(baseSubmission);
    const repository = new ContactSubmissionsRepository({
      contactSubmission: {
        findFirst,
      },
    } as never);

    const result = await repository.findPendingByPhone('0886337733');

    expect(findFirst).toHaveBeenCalledWith({
      orderBy: { created_at: 'desc' },
      where: {
        phone: '0886337733',
        status: { in: ['NEW', 'IN_PROGRESS'] },
      },
    });
    expect(result).toBe(baseSubmission);
  });
});

describe('Contact submission public endpoint', () => {
  it('uses a stricter write rate limit than the global API limit', () => {
    const controllerSource = readFileSync(
      require.resolve('@/modules/contact-submissions/contact-submissions.controller'),
      'utf8',
    );

    expect(controllerSource).toMatch(
      /@Throttle\(\{\s*default:\s*\{\s*limit:\s*5,\s*ttl:\s*60_000\s*\}\s*\}\)/,
    );
  });
});

describe('Contact submission database invariants', () => {
  it('enforces one pending submission per normalized phone', () => {
    const migrationSource = readFileSync(
      join(
        __dirname,
        '../../../../prisma/migrations/20260729140000_enforce_unique_pending_contact_phone/migration.sql',
      ),
      'utf8',
    );

    expect(migrationSource).toMatch(
      /CREATE UNIQUE INDEX "contact_submissions_pending_phone_unique"/,
    );
    expect(migrationSource).toMatch(
      /WHERE "status" IN \('NEW', 'IN_PROGRESS'\)/,
    );
  });
});
