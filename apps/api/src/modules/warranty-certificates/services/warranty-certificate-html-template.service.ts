import { Injectable } from '@nestjs/common';
import type { WarrantyCertificateViewModel } from '@/modules/warranty-certificates/warranty-certificate.types';
import Handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';

const TEMPLATE_FILE_NAME = 'certificate.html';
const STYLES_FILE_NAME = 'certificate.css';
const LOGO_FILE_NAME = path.join('assets', 'brand-logo.png');

type WarrantyCertificateTemplateContext = WarrantyCertificateViewModel & {
  brandLogoDataUrl: string;
  styles: string;
};

@Injectable()
export class WarrantyCertificateHtmlTemplateService {
  private readonly renderTemplate: Handlebars.TemplateDelegate<WarrantyCertificateTemplateContext>;
  private readonly styles: string;
  private readonly brandLogoDataUrl: string;

  constructor() {
    this.renderTemplate = Handlebars.compile(
      fs.readFileSync(resolveTemplateAssetPath(TEMPLATE_FILE_NAME), 'utf8'),
    );
    this.styles = fs.readFileSync(
      resolveTemplateAssetPath(STYLES_FILE_NAME),
      'utf8',
    );
    this.brandLogoDataUrl = `data:image/png;base64,${fs
      .readFileSync(resolveTemplateAssetPath(LOGO_FILE_NAME))
      .toString('base64')}`;
  }

  render(viewModel: WarrantyCertificateViewModel) {
    return this.renderTemplate({
      ...viewModel,
      brandLogoDataUrl: this.brandLogoDataUrl,
      styles: this.styles,
    });
  }
}

function resolveTemplateAssetPath(fileName: string) {
  const candidates = [
    path.join(__dirname, '..', 'templates', fileName),
    path.join(
      process.cwd(),
      'src',
      'modules',
      'warranty-certificates',
      'templates',
      fileName,
    ),
    path.join(
      process.cwd(),
      'dist',
      'modules',
      'warranty-certificates',
      'templates',
      fileName,
    ),
  ];
  const filePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!filePath) {
    throw new Error(
      `WARRANTY_CERTIFICATE_TEMPLATE_ASSET_NOT_FOUND:${fileName}`,
    );
  }

  return filePath;
}
