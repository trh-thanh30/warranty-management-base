import { Permissions } from '@/common/decorators/permissions.decorator';
import { User } from '@/common/decorators/user.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { AssignWarrantyClaimServiceCenterDto } from '@/modules/warranty-claims/dto/assign-warranty-claim-service-center.dto';
import { CreateWarrantyClaimDto } from '@/modules/warranty-claims/dto/create-warranty-claim.dto';
import { LinkWarrantyClaimAssetDto } from '@/modules/warranty-claims/dto/link-warranty-claim-asset.dto';
import { ListWarrantyClaimsDto } from '@/modules/warranty-claims/dto/list-warranty-claims.dto';
import { UpdateWarrantyClaimPriorityDto } from '@/modules/warranty-claims/dto/update-warranty-claim-priority.dto';
import { UpdateWarrantyClaimStatusDto } from '@/modules/warranty-claims/dto/update-warranty-claim-status.dto';
import { WarrantyClaimMetricsDto } from '@/modules/warranty-claims/dto/warranty-claim-metrics.dto';
import { AssignWarrantyClaimServiceCenterUseCase } from '@/modules/warranty-claims/use-cases/assign-warranty-claim-service-center.use-case';
import { CreateWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim.use-case';
import { ExportWarrantyClaimsUseCase } from '@/modules/warranty-claims/use-cases/export-warranty-claims.use-case';
import { GetWarrantyClaimDetailUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-detail.use-case';
import { GetWarrantyClaimMetricsUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-metrics.use-case';
import { GetWarrantyClaimTimelineUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-timeline.use-case';
import { ListWarrantyClaimsUseCase } from '@/modules/warranty-claims/use-cases/list-warranty-claims.use-case';
import { LinkWarrantyClaimAssetUseCase } from '@/modules/warranty-claims/use-cases/link-warranty-claim-asset.use-case';
import { ListWarrantyClaimAssetsUseCase } from '@/modules/warranty-claims/use-cases/list-warranty-claim-assets.use-case';
import { LookupWarrantyClaimByCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claim-by-code.use-case';
import { LookupWarrantyClaimsByWarrantyCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claims-by-warranty-code.use-case';
import { UnlinkWarrantyClaimAssetUseCase } from '@/modules/warranty-claims/use-cases/unlink-warranty-claim-asset.use-case';
import { UpdateWarrantyClaimPriorityUseCase } from '@/modules/warranty-claims/use-cases/update-warranty-claim-priority.use-case';
import { UpdateWarrantyClaimStatusUseCase } from '@/modules/warranty-claims/use-cases/update-warranty-claim-status.use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { permission_key } from '@prisma/client';
import type { Response } from 'express';

type RequestUser = {
  id?: string;
};

@Controller('warranty-claims')
export class WarrantyClaimsController {
  constructor(
    private readonly createWarrantyClaimUseCase: CreateWarrantyClaimUseCase,
    private readonly exportWarrantyClaimsUseCase: ExportWarrantyClaimsUseCase,
    private readonly listWarrantyClaimsUseCase: ListWarrantyClaimsUseCase,
    private readonly getWarrantyClaimDetailUseCase: GetWarrantyClaimDetailUseCase,
    private readonly getWarrantyClaimMetricsUseCase: GetWarrantyClaimMetricsUseCase,
    private readonly getWarrantyClaimTimelineUseCase: GetWarrantyClaimTimelineUseCase,
    private readonly listWarrantyClaimAssetsUseCase: ListWarrantyClaimAssetsUseCase,
    private readonly linkWarrantyClaimAssetUseCase: LinkWarrantyClaimAssetUseCase,
    private readonly unlinkWarrantyClaimAssetUseCase: UnlinkWarrantyClaimAssetUseCase,
    private readonly lookupWarrantyClaimByCodeUseCase: LookupWarrantyClaimByCodeUseCase,
    private readonly lookupWarrantyClaimsByWarrantyCodeUseCase: LookupWarrantyClaimsByWarrantyCodeUseCase,
    private readonly updateWarrantyClaimStatusUseCase: UpdateWarrantyClaimStatusUseCase,
    private readonly updateWarrantyClaimPriorityUseCase: UpdateWarrantyClaimPriorityUseCase,
    private readonly assignWarrantyClaimServiceCenterUseCase: AssignWarrantyClaimServiceCenterUseCase,
  ) {}

  @Post()
  @Permissions([permission_key.WARRANTY_CLAIM_CREATE])
  create(@Body() dto: CreateWarrantyClaimDto) {
    return this.createWarrantyClaimUseCase.execute(dto);
  }

  @Get()
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  list(@Query() query: ListWarrantyClaimsDto) {
    return this.listWarrantyClaimsUseCase.execute(query);
  }

  @Get('export')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  async export(
    @Query() query: ListWarrantyClaimsDto,
    @Res() response: Response,
  ) {
    const buffer = await this.exportWarrantyClaimsUseCase.execute(query);
    sendExcelFile(
      response,
      buffer,
      createDatedExcelFilename('warranty-claims'),
    );
  }

  @Get('metrics/summary')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  metrics(@Query() query: WarrantyClaimMetricsDto) {
    return this.getWarrantyClaimMetricsUseCase.execute(query);
  }

  @Get('by-code/:claimCode')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  lookupByClaimCode(@Param('claimCode') claimCode: string) {
    return this.lookupWarrantyClaimByCodeUseCase.execute(claimCode);
  }

  @Get('by-warranty-code/:warrantyCode')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  lookupByWarrantyCode(@Param('warrantyCode') warrantyCode: string) {
    return this.lookupWarrantyClaimsByWarrantyCodeUseCase.execute(warrantyCode);
  }

  @Get(':id')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  detail(@Param('id') id: string) {
    return this.getWarrantyClaimDetailUseCase.execute(id);
  }

  @Get(':id/timeline')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  timeline(@Param('id') id: string) {
    return this.getWarrantyClaimTimelineUseCase.execute(id);
  }

  @Get(':id/assets')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  listAssets(@Param('id') id: string) {
    return this.listWarrantyClaimAssetsUseCase.execute(id);
  }

  @Post(':id/assets')
  @Permissions([permission_key.WARRANTY_CLAIM_UPDATE])
  linkAsset(
    @Param('id') id: string,
    @Body() dto: LinkWarrantyClaimAssetDto,
    @User() user: RequestUser,
  ) {
    return this.linkWarrantyClaimAssetUseCase.execute(id, dto, {
      linkedByUserId: user?.id,
    });
  }

  @Delete(':id/assets/:assetId')
  @Permissions([permission_key.WARRANTY_CLAIM_UPDATE])
  unlinkAsset(@Param('id') id: string, @Param('assetId') assetId: string) {
    return this.unlinkWarrantyClaimAssetUseCase.execute(id, assetId);
  }

  @Patch(':id/assign-service-center')
  @Permissions([permission_key.WARRANTY_CLAIM_UPDATE])
  assignServiceCenter(
    @Param('id') id: string,
    @Body() dto: AssignWarrantyClaimServiceCenterDto,
    @User() user: RequestUser,
  ) {
    return this.assignWarrantyClaimServiceCenterUseCase.execute(id, dto, {
      changedByUserId: user?.id,
    });
  }

  @Patch(':id/status')
  @Permissions([permission_key.WARRANTY_CLAIM_STATUS_UPDATE])
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWarrantyClaimStatusDto,
    @User() user: RequestUser,
  ) {
    return this.updateWarrantyClaimStatusUseCase.execute(id, dto, {
      changedByUserId: user?.id,
    });
  }

  @Patch(':id/priority')
  @Permissions([permission_key.WARRANTY_CLAIM_UPDATE])
  updatePriority(
    @Param('id') id: string,
    @Body() dto: UpdateWarrantyClaimPriorityDto,
  ) {
    return this.updateWarrantyClaimPriorityUseCase.execute(id, dto);
  }
}
