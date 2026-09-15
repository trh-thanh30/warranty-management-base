import { Injectable } from '@nestjs/common';
import {
  DEFAULT_ACTIVATION_LABEL_HEIGHT_MM,
  DEFAULT_ACTIVATION_LABEL_WIDTH_MM,
} from '@repo/shared/constants';
import {
  resolveActivationLabelLayout,
  type ActivationLabelSize,
} from '@repo/shared/utils';

export const ACTIVATION_LABELS_PER_PAGE = 64;
export {
  DEFAULT_ACTIVATION_LABEL_HEIGHT_MM,
  DEFAULT_ACTIVATION_LABEL_WIDTH_MM,
};

@Injectable()
export class ActivationLabelTemplateService {
  render(
    batch: { productName: string; expiresAt: Date },
    codes: string[],
    size: ActivationLabelSize = {
      labelHeightMm: DEFAULT_ACTIVATION_LABEL_HEIGHT_MM,
      labelWidthMm: DEFAULT_ACTIVATION_LABEL_WIDTH_MM,
    },
  ) {
    const layout = resolveActivationLabelLayout(size);
    const horizontalPaddingMm = Math.min(
      3,
      Math.round(layout.labelWidthMm * 0.07 * 10) / 10,
    );
    const verticalPaddingMm = Math.min(
      2,
      Math.round(layout.labelHeightMm * 0.12 * 10) / 10,
    );
    const sheets = Array.from(
      { length: Math.ceil(codes.length / layout.labelsPerPage) },
      (_, i) => {
        const page = codes.slice(
          i * layout.labelsPerPage,
          (i + 1) * layout.labelsPerPage,
        );
        return `<section class="sheet">${page.map((code) => `<article class="label"><strong>${escapeHtml(batch.productName)}</strong><b>${escapeHtml(code)}</b><small>Kích hoạt trước ${formatDate(batch.expiresAt)}</small></article>`).join('')}</section>`;
      },
    ).join('');
    return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}body{width:210mm;font-family:Arial,sans-serif;color:#111}.sheet{display:grid;grid-template-columns:repeat(${layout.columns},${layout.labelWidthMm}mm);grid-template-rows:repeat(${layout.rows},${layout.labelHeightMm}mm);width:${layout.sheetWidthMm}mm;height:${layout.sheetHeightMm}mm;margin:10mm auto 16.6mm;break-after:page;page-break-after:always}.sheet:last-child{break-after:auto;page-break-after:auto}.label{width:${layout.labelWidthMm}mm;height:${layout.labelHeightMm}mm;border:.2mm solid #999;padding:${verticalPaddingMm}mm ${horizontalPaddingMm}mm;display:flex;flex-direction:column;justify-content:center;overflow:hidden;line-height:1.1}.label strong{font-size:7pt;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.label b{font-size:8pt;letter-spacing:.4px;margin:1mm 0}.label small{font-size:5.5pt;color:#444}</style></head><body>${sheets}</body></html>`;
  }
}
function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ] ?? c,
  );
}
function formatDate(value: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(value);
}
