import { NotFoundError } from '@/common/response';
import { CreateServiceCenterUseCase } from '@/modules/service-centers/use-cases/create-service-center.use-case';
import { GetServiceCenterDetailUseCase } from '@/modules/service-centers/use-cases/get-service-center-detail.use-case';
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
  created_at: new Date('2026-07-03T00:00:00.000Z'),
  updated_at: new Date('2026-07-03T00:00:00.000Z'),
};

describe('Service center use cases', () => {
  const serviceCentersRepository = {
    create: jest.fn(),
    list: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
    });

    expect(serviceCentersRepository.create).toHaveBeenCalledWith({
      name: 'Tram Bao Hanh Ha Noi',
      phone: '0901234567',
      email: 'support@example.com',
      province: 'Ha Noi',
      district: 'Hai Ba Trung',
      address: '123 Pho Hue',
    });
    expect(result.id).toBe('service-center-id');
  });

  it('lists service centers with filters', async () => {
    serviceCentersRepository.list.mockResolvedValue([serviceCenter]);
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
    expect(result[0]?.name).toBe('Tram Bao Hanh Ha Noi');
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
});
