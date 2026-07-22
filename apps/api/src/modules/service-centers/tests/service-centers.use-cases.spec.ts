import { ConflictError, NotFoundError } from '@/common/response';
import { CreateServiceCenterUseCase } from '@/modules/service-centers/use-cases/create-service-center.use-case';
import { createServiceCenterExportWorkbook } from '@/modules/service-centers/excel/service-center-workbook.factory';
import { GetServiceCenterDetailUseCase } from '@/modules/service-centers/use-cases/get-service-center-detail.use-case';
import { ImportServiceCentersUseCase } from '@/modules/service-centers/use-cases/import-service-centers.use-case';
import { ListServiceCenterProvincesUseCase } from '@/modules/service-centers/use-cases/list-service-center-provinces.use-case';
import { ListServiceCentersUseCase } from '@/modules/service-centers/use-cases/list-service-centers.use-case';
import { UpdateServiceCenterUseCase } from '@/modules/service-centers/use-cases/update-service-center.use-case';

const serviceCenter = {
  id: 'service-center-id',
  name: 'Tram Bao Hanh Ha Noi',
  phone: '0901234567',
  email: 'support@example.com',
  province: 'Ha Noi',
  district: 'Hai Ba Trung',
  address: '123 Pho Hue',
  is_active: true,
  metadata: {
    googleMapsUrl: 'https://maps.google.com/?q=123+Pho+Hue',
  },
  created_at: new Date('2026-07-03T00:00:00.000Z'),
  updated_at: new Date('2026-07-03T00:00:00.000Z'),
};

describe('Service center use cases', () => {
  const serviceCentersRepository = {
    create: jest.fn(),
    list: jest.fn(),
    listAll: jest.fn(),
    listForExport: jest.fn(),
    importRows: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    listProvinces: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    serviceCentersRepository.findByEmail.mockResolvedValue(null);
    serviceCentersRepository.findByPhone.mockResolvedValue(null);
  });

  it('rejects a duplicate service center phone', async () => {
    serviceCentersRepository.findByPhone.mockResolvedValue(serviceCenter);
    const useCase = new CreateServiceCenterUseCase(
      serviceCentersRepository as never,
    );

    await expect(
      useCase.execute({
        name: 'Another Center',
        phone: '090 123-4567',
        province: 'Ha Noi',
        address: '456 Another Street',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(serviceCentersRepository.findByPhone).toHaveBeenCalledWith(
      '0901234567',
    );
    expect(serviceCentersRepository.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate service center email case-insensitively', async () => {
    serviceCentersRepository.findByEmail.mockResolvedValue(serviceCenter);
    const useCase = new CreateServiceCenterUseCase(
      serviceCentersRepository as never,
    );

    await expect(
      useCase.execute({
        name: 'Another Center',
        email: ' SUPPORT@EXAMPLE.COM ',
        province: 'Ha Noi',
        address: '456 Another Street',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(serviceCentersRepository.findByEmail).toHaveBeenCalledWith(
      'support@example.com',
    );
    expect(serviceCentersRepository.create).not.toHaveBeenCalled();
  });

  it('creates a service center with trimmed input', async () => {
    serviceCentersRepository.create.mockResolvedValue(serviceCenter);
    const useCase = new CreateServiceCenterUseCase(
      serviceCentersRepository as never,
    );

    const result = await useCase.execute({
      name: ' Tram Bao Hanh Ha Noi ',
      phone: ' 0901234567 ',
      email: ' support@example.com ',
      province: ' Ha Noi ',
      district: ' Hai Ba Trung ',
      address: ' 123 Pho Hue ',
      googleMapsUrl: ' https://maps.google.com/?q=123+Pho+Hue ',
    });

    expect(serviceCentersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Tram Bao Hanh Ha Noi',
        phone: '0901234567',
        email: 'support@example.com',
        province: 'Ha Noi',
        district: 'Hai Ba Trung',
        address: '123 Pho Hue',
        metadata: {
          googleMapsUrl: 'https://maps.google.com/?q=123+Pho+Hue',
        },
      }),
    );
    expect(result.id).toBe('service-center-id');
    expect(result.googleMapsUrl).toBe('https://maps.google.com/?q=123+Pho+Hue');
  });

  it('lists service centers with filters', async () => {
    serviceCentersRepository.list.mockResolvedValue({
      items: [serviceCenter],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    const useCase = new ListServiceCentersUseCase(
      serviceCentersRepository as never,
    );

    const result = await useCase.execute({
      province: 'Ha Noi',
      isActive: 'true',
    });

    expect(serviceCentersRepository.list).toHaveBeenCalledWith({
      province: 'Ha Noi',
      isActive: 'true',
    });
    expect(result.items[0]?.name).toBe('Tram Bao Hanh Ha Noi');
    expect(result.meta.total).toBe(1);
  });

  it('lists distinct service center provinces', async () => {
    serviceCentersRepository.listProvinces.mockResolvedValue([
      { province: 'Da Nang' },
      { province: 'Ha Noi' },
    ]);
    const useCase = new ListServiceCenterProvincesUseCase(
      serviceCentersRepository as never,
    );

    await expect(useCase.execute()).resolves.toEqual(['Da Nang', 'Ha Noi']);
  });

  it('returns service center detail', async () => {
    serviceCentersRepository.findById.mockResolvedValue(serviceCenter);
    const useCase = new GetServiceCenterDetailUseCase(
      serviceCentersRepository as never,
    );

    await expect(useCase.execute('service-center-id')).resolves.toMatchObject({
      id: 'service-center-id',
      province: 'Ha Noi',
    });
  });

  it('throws not found when service center detail is absent', async () => {
    serviceCentersRepository.findById.mockResolvedValue(null);
    const useCase = new GetServiceCenterDetailUseCase(
      serviceCentersRepository as never,
    );

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('updates a service center', async () => {
    serviceCentersRepository.findById.mockResolvedValue(serviceCenter);
    serviceCentersRepository.update.mockResolvedValue({
      ...serviceCenter,
      is_active: false,
    });
    const useCase = new UpdateServiceCenterUseCase(
      serviceCentersRepository as never,
    );

    const result = await useCase.execute('service-center-id', {
      isActive: false,
    });

    expect(serviceCentersRepository.update).toHaveBeenCalledWith(
      'service-center-id',
      expect.objectContaining({ is_active: false }),
    );
    expect(result.isActive).toBe(false);
  });

  it('rejects updating a service center to another center contact', async () => {
    serviceCentersRepository.findById.mockResolvedValue(serviceCenter);
    serviceCentersRepository.findByEmail.mockResolvedValue({
      ...serviceCenter,
      id: 'another-service-center-id',
    });
    const useCase = new UpdateServiceCenterUseCase(
      serviceCentersRepository as never,
    );

    await expect(
      useCase.execute('service-center-id', {
        email: 'OTHER@EXAMPLE.COM',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(serviceCentersRepository.findByEmail).toHaveBeenCalledWith(
      'other@example.com',
      'service-center-id',
    );
    expect(serviceCentersRepository.update).not.toHaveBeenCalled();
  });

  it('imports new and existing service centers in one transaction', async () => {
    const buffer = await createServiceCenterExportWorkbook([
      {
        name: 'Trạm Hà Nội',
        phone: '0901234567',
        email: 'support@example.com',
        province: 'Hà Nội',
        district: 'Phường Hai Bà Trưng',
        address: '123 Phố Huế',
        googleMapsUrl: 'https://maps.google.com/?q=123+Pho+Hue',
        isActive: true,
      },
      {
        name: 'Trạm Đà Nẵng',
        phone: null,
        email: 'danang@example.com',
        province: 'Đà Nẵng',
        district: 'Phường Hải Châu',
        address: '1 Nguyễn Văn Linh',
        googleMapsUrl: null,
        isActive: true,
      },
    ]);
    serviceCentersRepository.listAll.mockResolvedValue([serviceCenter]);
    serviceCentersRepository.importRows.mockResolvedValue({
      created: 1,
      updated: 1,
    });
    const useCase = new ImportServiceCentersUseCase(
      serviceCentersRepository as never,
    );

    const result = await useCase.execute({ buffer } as Express.Multer.File);

    expect(result).toEqual({ created: 1, updated: 1, errors: [] });
    expect(serviceCentersRepository.importRows).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          existingServiceCenterId: 'service-center-id',
          phone: '0901234567',
        }),
        expect.objectContaining({
          existingServiceCenterId: null,
          email: 'danang@example.com',
        }),
      ]),
    );
  });

  it('rejects contacts that belong to different service centers', async () => {
    const buffer = await createServiceCenterExportWorkbook([
      {
        name: 'Trạm xung đột',
        phone: '0901234567',
        email: 'other@example.com',
        province: 'Hà Nội',
        district: null,
        address: '123 Phố Huế',
        googleMapsUrl: null,
        isActive: true,
      },
    ]);
    serviceCentersRepository.listAll.mockResolvedValue([
      serviceCenter,
      {
        ...serviceCenter,
        id: 'other-service-center-id',
        phone: '0909999999',
        email: 'other@example.com',
      },
    ]);
    const useCase = new ImportServiceCentersUseCase(
      serviceCentersRepository as never,
    );

    const result = await useCase.execute({ buffer } as Express.Multer.File);

    expect(result.errors[0]).toMatchObject({ field: 'contact' });
    expect(serviceCentersRepository.importRows).not.toHaveBeenCalled();
  });
});
