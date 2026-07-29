import { Permissions } from '@/common/decorators/permissions.decorator';
import { ListProductTemplatesDto } from '@/modules/product-templates/dto/list-product-templates.dto';
import { CreateProductTemplateDto } from '@/modules/product-templates/dto/create-product-template.dto';
import { UpdateProductTemplateDto } from '@/modules/product-templates/dto/update-product-template.dto';
import { CreateProductTemplateUseCase } from '@/modules/product-templates/use-cases/create-product-template.use-case';
import { DeactivateProductTemplateUseCase } from '@/modules/product-templates/use-cases/deactivate-product-template.use-case';
import { GetProductTemplateDetailUseCase } from '@/modules/product-templates/use-cases/get-product-template-detail.use-case';
import { ListProductTemplatesUseCase } from '@/modules/product-templates/use-cases/list-product-templates.use-case';
import { UpdateProductTemplateUseCase } from '@/modules/product-templates/use-cases/update-product-template.use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { permission_key } from '@prisma/client';

@Controller('product-templates')
export class ProductTemplatesController {
  constructor(
    private readonly listProductTemplatesUseCase: ListProductTemplatesUseCase,
    private readonly getProductTemplateDetailUseCase: GetProductTemplateDetailUseCase,
    private readonly createProductTemplateUseCase: CreateProductTemplateUseCase,
    private readonly updateProductTemplateUseCase: UpdateProductTemplateUseCase,
    private readonly deactivateProductTemplateUseCase: DeactivateProductTemplateUseCase,
  ) {}

  @Get()
  @Permissions([permission_key.PRODUCT_TEMPLATE_VIEW])
  list(@Query() query: ListProductTemplatesDto) {
    return this.listProductTemplatesUseCase.execute(query);
  }

  @Post()
  @Permissions([permission_key.PRODUCT_TEMPLATE_CREATE])
  create(@Body() dto: CreateProductTemplateDto) {
    return this.createProductTemplateUseCase.execute(dto);
  }

  @Get(':id')
  @Permissions([permission_key.PRODUCT_TEMPLATE_VIEW])
  detail(@Param('id') id: string) {
    return this.getProductTemplateDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.PRODUCT_TEMPLATE_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateProductTemplateDto) {
    return this.updateProductTemplateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Permissions([permission_key.PRODUCT_TEMPLATE_UPDATE])
  deactivate(@Param('id') id: string) {
    return this.deactivateProductTemplateUseCase.execute(id);
  }
}
