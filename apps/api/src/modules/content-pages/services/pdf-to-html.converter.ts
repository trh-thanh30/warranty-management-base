import { Injectable } from '@nestjs/common';
import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

@Injectable()
export class PdfToHtmlConverter {
  async convert(buffer: Buffer): Promise<string> {
    const temporaryDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), 'content-document-'),
    );

    try {
      const inputPath = path.join(temporaryDirectory, 'document.pdf');
      const outputPrefix = path.join(temporaryDirectory, 'document');
      await fs.writeFile(inputPath, buffer);
      await execFileAsync(
        'pdftohtml',
        ['-s', '-noframes', '-i', inputPath, outputPrefix],
        {
          maxBuffer: 50 * 1024 * 1024,
          timeout: 30_000,
        },
      );

      const generatedFiles = await fs.readdir(temporaryDirectory);
      const htmlFile = generatedFiles.find((file) => file.endsWith('.html'));
      if (!htmlFile) return '';

      const html = await fs.readFile(
        path.join(temporaryDirectory, htmlFile),
        'utf8',
      );
      const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;

      return body
        .replace(/<a name="[^"]*"><\/a>/gi, '')
        .replace(/<hr>\s*<br>\s*Page \d+/gi, '')
        .trim();
    } finally {
      await fs.rm(temporaryDirectory, { force: true, recursive: true });
    }
  }
}
