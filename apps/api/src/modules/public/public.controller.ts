import { Public } from '@/common/decorators/public.decorator';
import { ListServiceCentersDto } from '@/modules/service-centers/dto/list-service-centers.dto';
import { LookupWarrantyDto } from '@/modules/warranties/dto/lookup-warranty.dto';
import { LookupWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/lookup-warranty-by-code.use-case';
import { CreatePublicWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-public-warranty-activation-request.dto';
import { CreatePublicWarrantyActivationRequestUseCase } from '@/modules/public/use-cases/create-public-warranty-activation-request.use-case';
import { PublicLookupWarrantyActivationRequestUseCase } from '@/modules/public/use-cases/public-lookup-warranty-activation-request.use-case';
import { CreateWarrantyClaimDto } from '@/modules/warranty-claims/dto/create-warranty-claim.dto';
import { CreatePublicWarrantyClaimUseCase } from '@/modules/public/use-cases/create-public-warranty-claim.use-case';
import { PublicListServiceCentersUseCase } from '@/modules/public/use-cases/public-list-service-centers.use-case';
import { PublicListNetworkLocationsUseCase } from '@/modules/public/use-cases/public-list-network-locations.use-case';
import { PublicListDealersUseCase } from '@/modules/public/use-cases/public-list-dealers.use-case';
import { ListPublicDealersDto } from '@/modules/public/dto/list-public-dealers.dto';
import { ListPublicDealerFilterOptionsDto } from '@/modules/public/dto/list-public-dealer-filter-options.dto';
import { PublicListDealerFilterOptionsUseCase } from '@/modules/public/use-cases/public-list-dealer-filter-options.use-case';
import { ListPublicNetworkDirectoryDto } from '@/modules/public/dto/list-public-network-directory.dto';
import { ListPublicNetworkDirectoryFilterOptionsDto } from '@/modules/public/dto/list-public-network-directory-filter-options.dto';
import { PublicListNetworkDirectoryUseCase } from '@/modules/public/use-cases/public-list-network-directory.use-case';
import { PublicListNetworkDirectoryFilterOptionsUseCase } from '@/modules/public/use-cases/public-list-network-directory-filter-options.use-case';
import { ListPublicProductsDto } from '@/modules/products/dto/list-public-products.dto';
import { ListPublicProductsUseCase } from '@/modules/products/use-cases/list-public-products.use-case';
import { GetPublicProductDetailUseCase } from '@/modules/products/use-cases/get-public-product-detail.use-case';
import { ListPublicProductCategoriesUseCase } from '@/modules/categories/use-cases/list-public-product-categories.use-case';
import { ListPublicProductCategoriesDto } from '@/modules/categories/dto/list-public-product-categories.dto';
import { PublicLookupWarrantyClaimByCodeUseCase } from '@/modules/public/use-cases/public-lookup-warranty-claim-by-code.use-case';
import { PublicLookupWarrantyClaimsByWarrantyCodeUseCase } from '@/modules/public/use-cases/public-lookup-warranty-claims-by-warranty-code.use-case';
import { PublicSubmissionAbuseGuard } from '@/modules/public/guards/public-submission-abuse.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

const PUBLIC_WARRANTY_THROTTLE = {
  default: {
    blockDuration: 5 * 60_000,
    limit: 5,
    ttl: 60_000,
  },
} as const;

@Public()
@Controller('public')
export class PublicController {
  constructor(
    private readonly lookupWarrantyByCodeUseCase: LookupWarrantyByCodeUseCase,
    private readonly createPublicWarrantyActivationRequestUseCase: CreatePublicWarrantyActivationRequestUseCase,
    private readonly publicLookupWarrantyActivationRequestUseCase: PublicLookupWarrantyActivationRequestUseCase,
    private readonly createPublicWarrantyClaimUseCase: CreatePublicWarrantyClaimUseCase,
    private readonly publicLookupWarrantyClaimByCodeUseCase: PublicLookupWarrantyClaimByCodeUseCase,
    private readonly publicLookupWarrantyClaimsByWarrantyCodeUseCase: PublicLookupWarrantyClaimsByWarrantyCodeUseCase,
    private readonly publicListServiceCentersUseCase: PublicListServiceCentersUseCase,
    private readonly publicListNetworkLocationsUseCase: PublicListNetworkLocationsUseCase,
    private readonly publicListDealersUseCase: PublicListDealersUseCase,
    private readonly publicListDealerFilterOptionsUseCase: PublicListDealerFilterOptionsUseCase,
    private readonly publicListNetworkDirectoryUseCase: PublicListNetworkDirectoryUseCase,
    private readonly publicListNetworkDirectoryFilterOptionsUseCase: PublicListNetworkDirectoryFilterOptionsUseCase,
    private readonly listPublicProductsUseCase: ListPublicProductsUseCase,
    private readonly getPublicProductDetailUseCase: GetPublicProductDetailUseCase,
    private readonly listPublicProductCategoriesUseCase: ListPublicProductCategoriesUseCase,
  ) {}

  @Throttle(PUBLIC_WARRANTY_THROTTLE)
  @Get('warranties/lookup')
  lookupWarranty(@Query() query: LookupWarrantyDto) {
    return this.lookupWarrantyByCodeUseCase.execute(query);
  }

  @UseGuards(PublicSubmissionAbuseGuard)
  @Throttle(PUBLIC_WARRANTY_THROTTLE)
  @Post('warranty-activation-requests')
  createWarrantyActivationRequest(
    @Body() dto: CreatePublicWarrantyActivationRequestDto,
  ) {
    return this.createPublicWarrantyActivationRequestUseCase.execute(dto);
  }

  @Throttle(PUBLIC_WARRANTY_THROTTLE)
  @Get('warranty-activation-requests/:requestCode')
  lookupWarrantyActivationRequest(@Param('requestCode') requestCode: string) {
    return this.publicLookupWarrantyActivationRequestUseCase.execute(
      requestCode,
    );
  }

  @UseGuards(PublicSubmissionAbuseGuard)
  @Throttle(PUBLIC_WARRANTY_THROTTLE)
  @Post('warranty-claims')
  createWarrantyClaim(@Body() dto: CreateWarrantyClaimDto) {
    return this.createPublicWarrantyClaimUseCase.execute(dto);
  }

  @Throttle(PUBLIC_WARRANTY_THROTTLE)
  @Get('warranty-claims/by-code/:claimCode')
  lookupWarrantyClaimByCode(@Param('claimCode') claimCode: string) {
    return this.publicLookupWarrantyClaimByCodeUseCase.execute(claimCode);
  }

  @Throttle(PUBLIC_WARRANTY_THROTTLE)
  @Get('warranty-claims/by-warranty-code/:warrantyCode')
  lookupWarrantyClaimsByWarrantyCode(
    @Param('warrantyCode') warrantyCode: string,
  ) {
    return this.publicLookupWarrantyClaimsByWarrantyCodeUseCase.execute(
      warrantyCode,
    );
  }

  @Get('service-centers')
  listServiceCenters(@Query() query: ListServiceCentersDto) {
    return this.publicListServiceCentersUseCase.execute(query);
  }

  @Get('network-locations')
  listNetworkLocations() {
    return this.publicListNetworkLocationsUseCase.execute();
  }

  @Get('network-directory')
  listNetworkDirectory(@Query() query: ListPublicNetworkDirectoryDto) {
    return this.publicListNetworkDirectoryUseCase.execute(query);
  }

  @Get('network-directory/filter-options')
  listNetworkDirectoryFilterOptions(
    @Query() query: ListPublicNetworkDirectoryFilterOptionsDto,
  ) {
    return this.publicListNetworkDirectoryFilterOptionsUseCase.execute(
      query.province,
    );
  }

  @Get('dealers')
  listDealers(@Query() query: ListPublicDealersDto) {
    return this.publicListDealersUseCase.execute(query);
  }

  @Get('dealers/filter-options')
  listDealerFilterOptions(@Query() query: ListPublicDealerFilterOptionsDto) {
    return this.publicListDealerFilterOptionsUseCase.execute(query.province);
  }

  @Get('products')
  listProducts(@Query() query: ListPublicProductsDto) {
    return this.listPublicProductsUseCase.execute(query);
  }

  @Get('products/:slug')
  getProductDetail(@Param('slug') slug: string) {
    return this.getPublicProductDetailUseCase.execute(slug);
  }

  @Get('product-categories')
  listProductCategories(@Query() query: ListPublicProductCategoriesDto) {
    return this.listPublicProductCategoriesUseCase.execute(query);
  }
}
