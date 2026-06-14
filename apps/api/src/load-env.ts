import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export function loadEnv() {
  const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
  const possiblePaths = [
    path.join(process.cwd(), '..', '..', envFile),
    path.join(process.cwd(), envFile),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return envPath;
    }
  }

  return null;
}
