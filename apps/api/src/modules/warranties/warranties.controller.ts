import { Permissions } from '@/common/decorators/permissions.decorator';
import { User } from '@/common/decorators/user.decorator';
import { ActivateWarrantyDto } from '@/modules/warranties/dto/activate-warranty.dto';
import { LookupWarrantyDto } from '@/modules/warranties/dto/lookup-warranty.dto';
import { ActivateWarrantyUseCase } from '@/modules/warranties/use-cases/activate-warranty.use-case';
import { GetMyProductWarrantyUseCase } from '@/modules/warranties/use-cases/get-my-product-warranty.use-case';
import { GetWarrantyByProductUseCase } from '@/modules/warranties/use-cases/get-warranty-by-product.use-case';
import { ListMyProductsUseCase } from '@/modules/warranties/use-cases/list-my-products.use-case';
import { LookupWarrantyForCustomerUseCase } from '@/modules/warranties/use-cases/lookup-warranty-for-customer.use-case';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { permission_key } from '@prisma/client';

type RequestUser = {
  id: string;
};

@Controller()
export class WarrantiesController {
  constructor(
    private readonly activateWarrantyUseCase: ActivateWarrantyUseCase,
    private readonly getWarrantyByProductUseCase: GetWarrantyByProductUseCase,
    private readonly lookupWarrantyForCustomerUseCase: LookupWarrantyForCustomerUseCase,
    private readonly listMyProductsUseCase: ListMyProductsUseCase,
    private readonly getMyProductWarrantyUseCase: GetMyProductWarrantyUseCase,
  ) {}

  @Post('products/:id/activate-warranty')
  @Permissions([permission_key.WARRANTY_ACTIVATE])
  activateWarranty(
    @Param('id') productId: string,
    @Body() dto: ActivateWarrantyDto,
  ) {
    return this.activateWarrantyUseCase.execute(productId, dto);
  }

  @Get('products/:id/warranty')
  @Permissions([permission_key.WARRANTY_VIEW])
  getWarrantyByProduct(@Param('id') productId: string) {
    return this.getWarrantyByProductUseCase.execute(productId);
  }

  @Get('me/products')
  @Permissions([permission_key.PRODUCT_VIEW])
  listMyProducts(@User() user: RequestUser) {
    return this.listMyProductsUseCase.execute(user.id);
  }

  @Post('me/warranty-lookup')
  @Permissions([permission_key.WARRANTY_LOOKUP_OWN])
  lookupWarranty(@User() user: RequestUser, @Body() dto: LookupWarrantyDto) {
    return this.lookupWarrantyForCustomerUseCase.execute(user.id, dto);
  }

  @Get('me/products/:id/warranty')
  @Permissions([permission_key.WARRANTY_VIEW])
  getMyProductWarranty(
    @User() user: RequestUser,
    @Param('id') productId: string,
  ) {
    return this.getMyProductWarrantyUseCase.execute(user.id, productId);
  }
}
