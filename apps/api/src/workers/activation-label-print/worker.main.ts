import { NestFactory } from '@nestjs/core';
import { ActivationLabelPrintWorkerModule } from '@/workers/activation-label-print/worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    ActivationLabelPrintWorkerModule,
  );
  console.log('⚙️ Activation label print worker started');

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(
      `⚙️ Activation label worker received ${signal}, shutting down...`,
    );
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void bootstrap();
