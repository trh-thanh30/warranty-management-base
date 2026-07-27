import { AssetsService } from '@/modules/assets/assets.service';
import { ListProductTemplatesDto } from '@/modules/product-templates/dto/list-product-templates.dto';
import { toProductTemplateResponse } from '@/modules/product-templates/product-templates.types';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListProductTemplatesUseCase {
  constructor(
    private readonly productTemplatesRepository: ProductTemplatesRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(query: ListProductTemplatesDto) {
    const result = await this.productTemplatesRepository.list(query);
    return {
      items: result.items.map((template) =>
        toProductTemplateResponse(
          template,
          (asset) => this.assetsService.enrichAssetUrl(asset).url,
        ),
      ),
      meta: result.meta,
    };
  }
}
