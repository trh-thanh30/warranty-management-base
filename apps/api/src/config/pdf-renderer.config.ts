import { registerAs } from '@nestjs/config';

export default registerAs('pdfRenderer', () => ({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  maxBodyBytes: Number(process.env.PDF_MAX_BODY_BYTES ?? 10_485_760),
  timeoutMs: Number(process.env.PDF_RENDER_TIMEOUT_MS ?? 45_000),
  url: process.env.PDF_RENDERER_URL,
}));
