import { Injectable } from '@nestjs/common';
import { formatWarrantyCertificateDate } from '@/modules/warranty-certificates/utils/warranty-certificate-date.util';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, type PDFFont, type PDFPage, rgb } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';

const TEMPLATE_FILE_NAME = 'lexzenz-certificate.pdf';
const FONT_FILE_NAME = 'LiberationSans-Bold.ttf';
const FIELD_FONT_SIZE = 24;

export type WarrantyCertificatePdfInput = {
  certificateNumber: string;
  customerAddress?: string | null;
  customerEmail?: string | null;
  customerName: string;
  customerPhone?: string | null;
  dealerName?: string | null;
  endDate: Date | null;
  filmItems?: Record<string, string> | null;
  installedAt?: Date | null;
  productName: string;
  serialNumber: string | null;
  startDate: Date | null;
  vehicleModel?: string | null;
  vehiclePlate?: string | null;
  warrantyDurationMonths?: number | null;
  warrantyCode: string | null;
};

type DrawTextOptions = {
  maxWidth: number;
  size?: number;
  x: number;
  y: number;
};

@Injectable()
export class WarrantyCertificatePdfService {
  async createPdfBuffer(input: WarrantyCertificatePdfInput) {
    const pdfDoc = await PDFDocument.load(
      fs.readFileSync(resolveTemplateAssetPath(TEMPLATE_FILE_NAME)),
    );
    pdfDoc.registerFontkit(fontkit);

    const font = await pdfDoc.embedFont(
      fs.readFileSync(resolveTemplateAssetPath(FONT_FILE_NAME)),
    );
    const page = pdfDoc.getPages()[0];
    if (!page) {
      throw new Error('Warranty certificate template must have one page');
    }

    const draw = (
      value: string | number | null | undefined,
      options: DrawTextOptions,
    ) => {
      drawFittedText(page, font, formatValue(value), options);
    };

    draw(input.certificateNumber, {
      maxWidth: 390,
      size: 28,
      x: 1535,
      y: 1874,
    });

    draw(input.vehiclePlate, { maxWidth: 450, x: 365, y: 1004 });
    draw(input.vehicleModel, { maxWidth: 450, x: 365, y: 886 });
    draw(input.serialNumber, { maxWidth: 450, x: 365, y: 766 });
    draw(input.customerName, { maxWidth: 450, x: 365, y: 641 });
    draw(input.customerPhone, { maxWidth: 450, x: 365, y: 520 });
    draw(input.customerEmail, { maxWidth: 450, x: 365, y: 400 });
    draw(input.customerAddress, { maxWidth: 450, x: 365, y: 280 });

    draw(input.dealerName, { maxWidth: 490, x: 1320, y: 1004 });
    draw(formatWarrantyCertificateDate(input.installedAt ?? input.startDate), {
      maxWidth: 490,
      x: 1320,
      y: 924,
    });
    draw(input.productName, { maxWidth: 490, x: 1320, y: 844 });
    draw(input.filmItems?.windshield, { maxWidth: 490, x: 1320, y: 764 });
    draw(input.filmItems?.frontLeftSide, { maxWidth: 490, x: 1320, y: 684 });
    draw(input.filmItems?.frontRightSide, { maxWidth: 490, x: 1320, y: 604 });
    draw(input.filmItems?.rearLeftSide, { maxWidth: 490, x: 1320, y: 524 });
    draw(input.filmItems?.rearRightSide, { maxWidth: 490, x: 1320, y: 444 });
    draw(input.filmItems?.rearGlass, { maxWidth: 490, x: 1320, y: 364 });
    draw(formatWarrantyDuration(input.warrantyDurationMonths), {
      maxWidth: 490,
      x: 1320,
      y: 284,
    });
    draw(formatWarrantyCertificateDate(input.endDate), {
      maxWidth: 490,
      x: 1320,
      y: 204,
    });

    return Buffer.from(await pdfDoc.save());
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
      `Warranty certificate template asset '${fileName}' not found at ${candidates.join(', ')}`,
    );
  }

  return filePath;
}

function drawFittedText(
  page: PDFPage,
  font: PDFFont,
  value: string,
  { maxWidth, size = FIELD_FONT_SIZE, x, y }: DrawTextOptions,
) {
  page.drawText(fitText(value, font, size, maxWidth), {
    color: rgb(0.05, 0.05, 0.05),
    font,
    size,
    x,
    y,
  });
}

function fitText(value: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(value, size) <= maxWidth) return value;

  let next = value;
  while (
    next.length > 1 &&
    font.widthOfTextAtSize(`${next}...`, size) > maxWidth
  ) {
    next = next.slice(0, -1);
  }

  return `${next.trimEnd()}...`;
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '-';

  const formatted = String(value).trim();
  return formatted || '-';
}

function formatWarrantyDuration(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value} tháng`
    : '-';
}
