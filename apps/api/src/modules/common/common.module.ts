import { CommonController } from '@/modules/common/common.controller';
import { CommonService } from '@/modules/common/common.service';
import { CommonUtils } from '@/modules/common/helpers/common.utils';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  controllers: [CommonController],
  providers: [CommonService, CommonUtils],
  exports: [CommonService],
})
export class CommonModule {}
