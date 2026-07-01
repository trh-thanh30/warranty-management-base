import { Permissions } from '@/common/decorators/permissions.decorator';
import { AssignProductOwnerDto } from '@/modules/products/dto/assign-product-owner.dto';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { ListProductsDto } from '@/modules/products/dto/list-products.dto';
import { UpdateProductDto } from '@/modules/products/dto/update-product.dto';
import { AssignProductOwnerUseCase } from '@/modules/products/use-cases/assign-product-owner.use-case';
import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';
import { GetProductDetailUseCase } from '@/modules/products/use-cases/get-product-detail.use-case';
import { ListProductsUseCase } from '@/modules/products/use-cases/list-products.use-case';
import { SoftDeleteProductUseCase } from '@/modules/products/use-cases/soft-delete-product.use-case';
import { UpdateProductUseCase } from '@/modules/products/use-cases/update-product.use-case';
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

@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly softDeleteProductUseCase: SoftDeleteProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductDetailUseCase: GetProductDetailUseCase,
    private readonly assignProductOwnerUseCase: AssignProductOwnerUseCase,
  ) {}

  @Get()
  @Permissions([permission_key.PRODUCT_VIEW])
  list(@Query() query: ListProductsDto) {
    return this.listProductsUseCase.execute(query);
  }

  @Post()
  @Permissions([permission_key.PRODUCT_CREATE])
  create(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  @Get(':id')
  @Permissions([permission_key.PRODUCT_VIEW])
  detail(@Param('id') id: string) {
    return this.getProductDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.PRODUCT_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Permissions([permission_key.PRODUCT_DELETE])
  remove(@Param('id') id: string) {
    return this.softDeleteProductUseCase.execute(id);
  }

  @Post(':id/assign-owner')
  @Permissions([permission_key.PRODUCT_ASSIGN_OWNER])
  assignOwner(@Param('id') id: string, @Body() dto: AssignProductOwnerDto) {
    return this.assignProductOwnerUseCase.execute(id, dto);
  }
}
