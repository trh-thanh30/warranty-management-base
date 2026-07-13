import { ListWarrantiesDto } from '@/modules/warranties/dto/list-warranties.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { toWarrantyListItemResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListWarrantiesUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(dto: ListWarrantiesDto) {
    const result = await this.warrantiesRepository.list(dto);

    return {
      items: result.items.map(toWarrantyListItemResponse),
      meta: result.meta,
    };
  }
}
