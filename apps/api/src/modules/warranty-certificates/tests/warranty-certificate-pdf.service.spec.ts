import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';

describe('WarrantyCertificatePdfService', () => {
  it('renders a warranty certificate from the PDF template', async () => {
    const service = new WarrantyCertificatePdfService();

    const pdf = await service.createPdfBuffer({
      certificateNumber: 'LEX-2026-0001',
      customerAddress: 'Hà Nội',
      customerEmail: 'khach@example.com',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0901234567',
      dealerName: 'Đại lý Lexzenz Hà Nội',
      endDate: new Date('2027-07-24T00:00:00.000Z'),
      filmItems: {
        frontLeftSide: 'LX-50',
        frontRightSide: 'LX-50',
        rearGlass: 'LX-20',
        rearLeftSide: 'LX-35',
        rearRightSide: 'LX-35',
        windshield: 'LX-70',
      },
      installedAt: new Date('2026-07-24T00:00:00.000Z'),
      productName: 'Film cách nhiệt ô tô Lexzenz Reflex Korea Film',
      serialNumber: 'SN-001',
      startDate: new Date('2026-07-24T00:00:00.000Z'),
      vehicleModel: 'Toyota Camry 2026',
      vehiclePlate: '30A-12345',
      warrantyCode: 'WM-2026-ABC123',
      warrantyDurationMonths: 36,
    });

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.byteLength).toBeGreaterThan(4_900_000);
  });
});
