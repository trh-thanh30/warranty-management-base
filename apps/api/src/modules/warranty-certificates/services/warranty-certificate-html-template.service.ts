import type { WarrantyCertificateViewModel } from '@/modules/warranty-certificates/types/warranty-certificate.types';
import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';

const TEMPLATE_FILE_NAME = 'certificate.html';
const STYLES_FILE_NAME = 'certificate.css';
const LOGO_FILE_NAME = path.join('assets', 'brand-logo.png');
const HERO_VEHICLE_FILE_NAME = path.join('assets', 'red-sedan-hero.png');
const FONT_FAMILY = 'Be Vietnam Pro';
const FONT_WEIGHTS = [400, 600, 700, 800] as const;

type WarrantyCertificateTemplateContext = WarrantyCertificateViewModel & {
  brandLogoDataUrl: string;
  fontFaceStyles: string;
  vehicleHeroDataUrl: string;
  styles: string;
};

@Injectable()
export class WarrantyCertificateHtmlTemplateService {
  private readonly renderTemplate: Handlebars.TemplateDelegate<WarrantyCertificateTemplateContext>;
  private readonly styles: string;
  private readonly brandLogoDataUrl: string;
  private readonly fontFaceStyles: string;
  private readonly vehicleHeroDataUrl: string;

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
    this.vehicleHeroDataUrl = `data:image/png;base64,${fs
      .readFileSync(resolveTemplateAssetPath(HERO_VEHICLE_FILE_NAME))
      .toString('base64')}`;
    this.fontFaceStyles = buildEmbeddedFontFaceStyles();
  }

  render(viewModel: WarrantyCertificateViewModel) {
    return this.renderTemplate({
      ...viewModel,
      brandLogoDataUrl: this.brandLogoDataUrl,
      fontFaceStyles: this.fontFaceStyles,
      vehicleHeroDataUrl: this.vehicleHeroDataUrl,
      styles: this.styles,
    });
  }
}

function buildEmbeddedFontFaceStyles() {
  return FONT_WEIGHTS.map((weight) => {
    const fontPath = require.resolve(
      `@fontsource/be-vietnam-pro/files/be-vietnam-pro-vietnamese-${weight}-normal.woff2`,
    );
    const fontData = fs.readFileSync(fontPath).toString('base64');

    return `@font-face {
  font-family: '${FONT_FAMILY}';
  src: url('data:font/woff2;base64,${fontData}') format('woff2');
  font-style: normal;
  font-weight: ${weight};
  font-display: block;
}`;
  }).join('\n');
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
