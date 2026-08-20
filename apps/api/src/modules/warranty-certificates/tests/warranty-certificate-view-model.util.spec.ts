import { buildWarrantyCertificateViewModel } from '@/modules/warranty-certificates/utils/warranty-certificate-view-model.util';

describe('buildWarrantyCertificateViewModel', () => {
  const input = {
    certificateNumber: 'CERT-2026-001',
    customerAddress: '12 Nguyễn Trãi, Hà Nội',
    customerEmail: 'customer@example.com',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    dealerName: 'Đại lý Lexzenz Hà Nội',
    endDate: new Date('2029-08-16T00:00:00.000Z'),
    filmItems: {
      windshield: 'SP50',
      rearGlass: 'SR10',
    },
    installedAt: new Date('2026-08-16T00:00:00.000Z'),
    productName: 'Phim cách nhiệt ô tô B',
    serialNumber: 'SERIAL-001',
    startDate: new Date('2026-08-16T00:00:00.000Z'),
    vehicleModel: 'Toyota Camry',
    vehiclePlate: '30A-12345',
    warrantyCode: 'WM-2026-001',
    warrantyDurationMonths: 36,
  };

  it('normalizes the current single-product certificate input', () => {
    const result = buildWarrantyCertificateViewModel(
      input,
      new Date('2026-08-20T00:00:00.000Z'),
    );

    expect(result).toMatchObject({
      certificate: {
        installedAt: '16/8/2026',
        issuedAt: '20/8/2026',
        number: 'CERT-2026-001',
      },
      customer: {
        address: '12 Nguyễn Trãi, Hà Nội',
        email: 'customer@example.com',
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
      },
      dealer: { name: 'Đại lý Lexzenz Hà Nội' },
      products: [
        {
          durationLabel: '36 tháng',
          expiryDate: '16/8/2029',
          positionLabel: 'Sản phẩm',
          productCode: 'Không',
          productName: 'Phim cách nhiệt ô tô B',
          serialNumber: 'SERIAL-001',
          warrantyCode: 'WM-2026-001',
        },
      ],
      vehicle: {
        model: 'Toyota Camry',
        plate: '30A-12345',
      },
    });
    expect(result.activationFields).toEqual([
      { label: 'Kính lái', value: 'SP50' },
      { label: 'Kính lưng', value: 'SR10' },
    ]);
  });

  it('omits blank fields and preserves unknown keys after known positions', () => {
    const result = buildWarrantyCertificateViewModel(
      {
        ...input,
        filmItems: {
          sunroof: 'SR15',
          rearGlass: '  ',
          windshield: 'SP50',
        },
      },
      new Date('2026-08-20T00:00:00.000Z'),
    );

    expect(result.activationFields).toEqual([
      { label: 'Kính lái', value: 'SP50' },
      { label: 'sunroof', value: 'SR15' },
    ]);
  });
});
