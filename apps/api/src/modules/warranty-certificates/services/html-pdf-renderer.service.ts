import pdfRendererConfig from '@/config/pdf-renderer.config';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import fs from 'node:fs';
import path from 'node:path';
import type { Page } from 'puppeteer-core';

const PDF_SIGNATURE = '%PDF-';
const MAX_DIAGNOSTIC_LENGTH = 500;

@Injectable()
export class HtmlPdfRendererService {
  constructor(
    @Inject(pdfRendererConfig.KEY)
    private readonly config: ConfigType<typeof pdfRendererConfig>,
  ) {}

  async createPdf(html: string): Promise<Buffer> {
    if (Buffer.byteLength(html, 'utf8') > this.config.maxBodyBytes) {
      throw new Error('PDF_RENDERER_HTML_TOO_LARGE');
    }

    if (this.config.url) {
      return this.createRemotePdf(html);
    }

    return this.createLocalPdf(html);
  }

  private async createRemotePdf(html: string) {
    const rendererUrl = `${this.config.url?.replace(/\/$/, '')}/render`;
    let response: Response;

    try {
      response = await fetch(rendererUrl, {
        body: JSON.stringify({ html }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        signal: AbortSignal.timeout(this.config.timeoutMs),
      });
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new Error(`PDF_RENDERER_TIMEOUT:${this.config.timeoutMs}`);
      }

      throw new Error(
        `PDF_RENDERER_UNAVAILABLE:${formatErrorDiagnostic(error)}`,
      );
    }

    if (!response.ok) {
      const diagnostic = (await response.text()).slice(
        0,
        MAX_DIAGNOSTIC_LENGTH,
      );
      throw new Error(
        `PDF_RENDERER_REQUEST_FAILED:${response.status}:${diagnostic}`,
      );
    }

    const pdf = Buffer.from(await response.arrayBuffer());
    if (pdf.length === 0) {
      throw new Error('PDF_RENDERER_EMPTY_RESPONSE');
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (
      !contentType.toLowerCase().includes('application/pdf') &&
      !hasPdfSignature(pdf)
    ) {
      throw new Error('PDF_RENDERER_INVALID_RESPONSE');
    }

    return pdf;
  }

  private async createLocalPdf(html: string) {
    const executablePath = resolveBrowserExecutable(this.config.executablePath);
    const puppeteer = await import('puppeteer-core');
    const browser = await puppeteer.launch({
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
      executablePath,
      headless: true,
    });

    try {
      const page = await browser.newPage();

      try {
        await page.setJavaScriptEnabled(false);
        await blockExternalRequests(page);
        await page.setContent(html, {
          timeout: this.config.timeoutMs,
          waitUntil: 'load',
        });
        await page.evaluate(async () => document.fonts.ready);

        const pdf = await page.pdf({
          preferCSSPageSize: true,
          printBackground: true,
        });

        return Buffer.from(pdf);
      } finally {
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
}

async function blockExternalRequests(page: Page) {
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = request.url();
    if (
      url === 'about:blank' ||
      url.startsWith('data:') ||
      url.startsWith('blob:')
    ) {
      void request.continue();
      return;
    }

    void request.abort('blockedbyclient');
  });
}

function hasPdfSignature(value: Buffer) {
  return value.subarray(0, PDF_SIGNATURE.length).toString() === PDF_SIGNATURE;
}

function isTimeoutError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  );
}

function formatErrorDiagnostic(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, MAX_DIAGNOSTIC_LENGTH);
}

function resolveBrowserExecutable(configuredPath?: string) {
  const programFiles = process.env.ProgramFiles;
  const programFilesX86 = process.env['ProgramFiles(x86)'];
  const candidates = [
    configuredPath,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    programFiles &&
      path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    programFilesX86 &&
      path.join(
        programFilesX86,
        'Microsoft',
        'Edge',
        'Application',
        'msedge.exe',
      ),
    programFiles &&
      path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ].filter((candidate): candidate is string => Boolean(candidate));
  const executablePath = candidates.find((candidate) =>
    fs.existsSync(candidate),
  );

  if (!executablePath) {
    throw new Error(`PDF_RENDERER_BROWSER_NOT_FOUND:${candidates.join(',')}`);
  }

  return executablePath;
}
