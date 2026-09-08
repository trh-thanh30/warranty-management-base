import { PrismaModule } from '@/database/prisma/prisma.module';
import { DealersController } from '@/modules/dealers/dealers.controller';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { CreateDealerUseCase } from '@/modules/dealers/use-cases/create-dealer.use-case';
import { DownloadDealerImportTemplateUseCase } from '@/modules/dealers/use-cases/download-dealer-import-template.use-case';
import { ExportDealersUseCase } from '@/modules/dealers/use-cases/export-dealers.use-case';
import { GetDealerDetailUseCase } from '@/modules/dealers/use-cases/get-dealer-detail.use-case';
import { GenerateDealerCodeUseCase } from '@/modules/dealers/use-cases/generate-dealer-code.use-case';
import { ImportDealersUseCase } from '@/modules/dealers/use-cases/import-dealers.use-case';
import { ListDealerProvincesUseCase } from '@/modules/dealers/use-cases/list-dealer-provinces.use-case';
import { ListDealersUseCase } from '@/modules/dealers/use-cases/list-dealers.use-case';
import { ListDealerActivatedCustomersUseCase } from '@/modules/dealers/use-cases/list-dealer-activated-customers.use-case';
import { UpdateDealerUseCase } from '@/modules/dealers/use-cases/update-dealer.use-case';
import { AddDealerMemberUseCase } from '@/modules/dealers/use-cases/add-dealer-member.use-case';
import { ListDealerMembersUseCase } from '@/modules/dealers/use-cases/list-dealer-members.use-case';
import { ListAssignedDealersUseCase } from '@/modules/dealers/use-cases/list-assigned-dealers.use-case';
import { ListManagedDealersUseCase } from '@/modules/dealers/use-cases/list-managed-dealers.use-case';
import { DealerAccessPolicy } from '@/modules/dealers/service/dealer-access.policy';
import { RemoveDealerMemberUseCase } from '@/modules/dealers/use-cases/remove-dealer-member.use-case';
import { UsersModule } from '@/modules/user/user.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [DealersController],
  providers: [
    DealersRepository,
    GenerateDealerCodeUseCase,
    CreateDealerUseCase,
    ListDealersUseCase,
    ListDealerActivatedCustomersUseCase,
    GetDealerDetailUseCase,
    UpdateDealerUseCase,
    ListDealerProvincesUseCase,
    DownloadDealerImportTemplateUseCase,
    ExportDealersUseCase,
    ImportDealersUseCase,
    AddDealerMemberUseCase,
    ListDealerMembersUseCase,
    ListAssignedDealersUseCase,
    ListManagedDealersUseCase,
    DealerAccessPolicy,
    RemoveDealerMemberUseCase,
  ],
  exports: [DealerAccessPolicy, DealersRepository, GenerateDealerCodeUseCase],
})
export class DealersModule {}
