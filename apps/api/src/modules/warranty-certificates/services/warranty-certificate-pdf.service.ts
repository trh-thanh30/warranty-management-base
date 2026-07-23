import { Injectable } from '@nestjs/common';
import { formatWarrantyCertificateDate } from '@/modules/warranty-certificates/utils/warranty-certificate-date.util';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, type PDFFont, type PDFPage, rgb } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';

const TEMPLATE_FILE_NAME = 'lexzenz-certificate.pdf';
const FONT_FILE_NAME = 'LiberationSans-Regular.ttf';

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
      maxWidth: 470,
      size: 30,
      x: 1510,
      y: 1778,
    });

    draw(input.vehiclePlate, { maxWidth: 460, x: 365, y: 1000 });
    draw(input.vehicleModel, { maxWidth: 460, x: 365, y: 880 });
    draw(input.serialNumber, { maxWidth: 460, x: 365, y: 760 });
    draw(input.customerName, { maxWidth: 460, x: 365, y: 635 });
    draw(input.customerPhone, { maxWidth: 460, x: 365, y: 515 });
    draw(input.customerEmail, { maxWidth: 460, x: 365, y: 395 });
    draw(input.customerAddress, { maxWidth: 460, x: 365, y: 275 });

    draw(input.dealerName, { maxWidth: 500, x: 1320, y: 1000 });
    draw(formatWarrantyCertificateDate(input.installedAt ?? input.startDate), {
      maxWidth: 500,
      x: 1320,
      y: 922,
    });
    draw(input.productName, { maxWidth: 500, x: 1320, y: 842 });
    draw(input.filmItems?.windshield, { maxWidth: 500, x: 1320, y: 762 });
    draw(input.filmItems?.frontLeftSide, { maxWidth: 500, x: 1320, y: 682 });
    draw(input.filmItems?.frontRightSide, { maxWidth: 500, x: 1320, y: 602 });
    draw(input.filmItems?.rearLeftSide, { maxWidth: 500, x: 1320, y: 522 });
    draw(input.filmItems?.rearRightSide, { maxWidth: 500, x: 1320, y: 442 });
    draw(input.filmItems?.rearGlass, { maxWidth: 500, x: 1320, y: 362 });
    draw(formatWarrantyDuration(input.warrantyDurationMonths), {
      maxWidth: 500,
      x: 1320,
      y: 282,
    });
    draw(formatWarrantyCertificateDate(input.endDate), {
      maxWidth: 500,
      x: 1320,
      y: 202,
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
  { maxWidth, size = 28, x, y }: DrawTextOptions,
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
