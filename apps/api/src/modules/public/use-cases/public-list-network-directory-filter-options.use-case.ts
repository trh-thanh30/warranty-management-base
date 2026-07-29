import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { Injectable } from '@nestjs/common';
import type { PublicNetworkDirectoryFilterOptions } from '@repo/shared';

@Injectable()
export class PublicListNetworkDirectoryFilterOptionsUseCase {
  constructor(
    private readonly dealersRepository: DealersRepository,
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(
    province?: string,
  ): Promise<PublicNetworkDirectoryFilterOptions> {
    const [dealers, serviceCenters] = await Promise.all([
      this.dealersRepository.listActiveForNetwork(),
      this.serviceCentersRepository.listActiveForNetwork(),
    ]);
    const locations = [...dealers, ...serviceCenters];
    const provinces = uniqueSorted(
      locations.map((location) => location.province),
    );
    const districts = province
      ? uniqueSorted(
          locations
            .filter((location) => location.province === province)
            .flatMap((location) =>
              location.district ? [location.district] : [],
            ),
        )
      : [];

    return { provinces, districts };
  }
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right, 'vi'),
  );
}
