import { ExampleService } from '@/modules/jobs/example.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [ExampleService],
})
export class JobsModule {}
