import { Injectable } from '@nestjs/common';

export const ACTIVATION_LABELS_PER_PAGE = 64;

@Injectable()
export class ActivationLabelTemplateService {
  render(
    batch: { productName: string; productSku: string; expiresAt: Date },
    codes: string[],
  ) {
    const sheets = Array.from(
      { length: Math.ceil(codes.length / ACTIVATION_LABELS_PER_PAGE) },
      (_, i) => {
        const page = codes.slice(
          i * ACTIVATION_LABELS_PER_PAGE,
          (i + 1) * ACTIVATION_LABELS_PER_PAGE,
        );
        return `<section class="sheet">${page.map((code) => `<article class="label"><strong>${escapeHtml(batch.productName)}</strong><span>SKU: ${escapeHtml(batch.productSku)}</span><b>${escapeHtml(code)}</b><small>Kích hoạt trước ${formatDate(batch.expiresAt)}</small></article>`).join('')}</section>`;
      },
    ).join('');
    return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}body{width:210mm;font-family:Arial,sans-serif;color:#111}.sheet{display:grid;grid-template-columns:repeat(4,45.7mm);grid-template-rows:repeat(16,16.9mm);width:182.8mm;height:270.4mm;margin:10mm auto 16.6mm;break-after:page;page-break-after:always}.sheet:last-child{break-after:auto;page-break-after:auto}.label{width:45.7mm;height:16.9mm;border:.2mm solid #999;padding:1.2mm;display:flex;flex-direction:column;justify-content:center;overflow:hidden;line-height:1.1}.label strong{font-size:7pt;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.label span,.label small{font-size:5.5pt}.label b{font-size:8pt;letter-spacing:.4px;margin:1mm 0}.label small{color:#444}</style></head><body>${sheets}</body></html>`;
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
