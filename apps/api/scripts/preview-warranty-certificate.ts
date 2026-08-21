import { WarrantyCertificateHtmlTemplateService } from '../src/modules/warranty-certificates/services/warranty-certificate-html-template.service';
import type { WarrantyCertificateViewModel } from '../src/modules/warranty-certificates/warranty-certificate.types';
import fs from 'node:fs';
import http, { type ServerResponse } from 'node:http';
import path from 'node:path';

const HOST = '127.0.0.1';
const PORT = Number(process.env.CERTIFICATE_PREVIEW_PORT ?? 4300);
const TEMPLATE_DIRECTORY = path.resolve(
  process.cwd(),
  'src',
  'modules',
  'warranty-certificates',
  'templates',
);
const clients = new Set<ServerResponse>();

const previewItems = [
  ['Kính lái', 'Phim cách nhiệt ô tô B', '7ZBTFW', 'YFPA76'],
  ['Kính sườn trước - trái', 'Phim cách nhiệt ô tô C', 'EQ2CC3', 'PXLBHE'],
  ['Kính sườn trước - phải', 'Phim cách nhiệt ô tô B', 'A8K2MN', 'K7N4QP'],
  ['Kính sườn sau - trái', 'Phim cách nhiệt ô tô C', 'C5R9TX', 'R2M8VL'],
  ['Kính sườn sau - phải', 'Phim cách nhiệt ô tô B', 'B4H7QW', 'T6J3KS'],
  ['Kính lưng', 'Phim cách nhiệt ô tô C', 'L9P2DF', 'H5W8NC'],
] as const;

const previewViewModel: WarrantyCertificateViewModel = {
  activationFields: previewItems.map(([label, productName]) => ({
    label,
    value: productName,
  })),
  certificate: {
    installedAt: '21/08/2026',
    issuedAt: '21/08/2026',
    number: 'CERT-2026-PREVIEW',
  },
  customer: {
    address: 'Khu phố Hoàng Xá, Phường Ninh Xá, Tỉnh Bắc Ninh',
    email: 'nguyenvanhung@example.com',
    fullName: 'Nguyễn Văn Hùng',
    phone: '0985 844 298',
  },
  dealer: { name: 'Công Thắng Auto' },
  products: previewItems.map(
    ([positionLabel, productName, productCodeSuffix, warrantyCodeSuffix]) => ({
      durationLabel: '36 tháng',
      expiryDate: '21/08/2029',
      positionLabel,
      productCode: `PRD-2026-${productCodeSuffix}`,
      productName,
      serialNumber: '-',
      warrantyCode: `WM-2026-${warrantyCodeSuffix}`,
    }),
  ),
  vehicle: { model: 'Sedan', plate: '30A-123.45' },
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${HOST}:${PORT}`);

  if (requestUrl.pathname === '/events') {
    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    });
    response.write(': connected\n\n');
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }

  if (requestUrl.pathname !== '/') {
    response.writeHead(404).end('Not found');
    return;
  }

  try {
    const viewModel =
      requestUrl.searchParams.get('case') === 'single'
        ? {
            ...previewViewModel,
            activationFields: previewViewModel.activationFields.slice(0, 1),
            products: previewViewModel.products.slice(0, 1),
          }
        : previewViewModel;
    const html = new WarrantyCertificateHtmlTemplateService()
      .render(viewModel)
      .replace(
        '</body>',
        `<script>
          const events = new EventSource('/events');
          events.onmessage = () => window.location.reload();
        </script></body>`,
      );
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/html; charset=utf-8',
    });
    response.end(html);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.stack : String(error));
  }
});

let reloadTimer: NodeJS.Timeout | undefined;
const watcher = fs.watch(TEMPLATE_DIRECTORY, { recursive: true }, () => {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    clients.forEach((client) => client.write('data: reload\n\n'));
  }, 100);
});

server.listen(PORT, HOST, () => {
  console.log(`Certificate preview: http://${HOST}:${PORT}`);
  console.log('Edit certificate.html, certificate.css or assets to reload.');
});

function shutdown() {
  watcher.close();
  clients.forEach((client) => client.end());
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
