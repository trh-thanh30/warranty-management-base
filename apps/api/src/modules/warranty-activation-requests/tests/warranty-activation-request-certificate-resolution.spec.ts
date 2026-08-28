import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';

describe('activation request certificate resolution', () => {
  it('maps one request certificate and no item certificates', () => {
    const response = toWarrantyActivationRequestResponse({
      ...buildRequest(),
      certificate: {
        certificate_number: 'CERT-REQUEST-1',
        email_status: 'PENDING',
        emailed_at: null,
        generated_at: new Date('2026-08-20T00:00:00.000Z'),
        id: 'request-certificate-1',
        last_error: null,
        recipient_email: 'customer@example.com',
        status: 'GENERATED',
        storage_key: 'private/request.pdf',
      },
      items: [
        {
          activated_at: new Date('2026-08-20T00:00:00.000Z'),
          activation_field_id: null,
          id: 'item-1',
          position_key: 'windshield',
          position_label: 'Kính lái',
          product_code: 'PRD-A',
          product_id: 'product-1',
          product_name: 'Film A',
          serial_number: null,
          status: 'ACTIVATED',
          warranty_code: 'WM-A',
          warranty_id: 'warranty-1',
          warranty: { status: 'ACTIVE', certificates: [] },
        },
      ],
    } as never);

    expect(response.certificate).toMatchObject({
      certificateNumber: 'CERT-REQUEST-1',
      downloadUrl:
        '/warranty-activation-requests/request-1/certificate/download',
      scope: 'ACTIVATION_REQUEST',
      viewUrl: '/warranty-activation-requests/request-1/certificate/view',
    });
    expect(response.items?.[0]).not.toHaveProperty('certificate');
  });
});

function buildRequest() {
  return {
    activated_warranty: null,
    activated_warranty_id: null,
    address_detail: 'Số 1',
    admin_note: null,
    brand: null,
    category_id: null,
    created_at: new Date('2026-08-20T00:00:00.000Z'),
    created_by: null,
    created_by_id: null,
    customer: null,
    customer_birthdate: null,
    customer_email: 'customer@example.com',
    customer_id: null,
    customer_name: 'Nguyễn Văn A',
    customer_phone: '0900000000',
    dealer: null,
    dealer_id: null,
    full_address: 'Hà Nội',
    id: 'request-1',
    installed_at: null,
    manufacture_year: null,
    metadata: null,
    model: null,
    note: null,
    product_id: null,
    product_name: null,
    province_code: '01',
    province_name: 'Hà Nội',
    rejection_reason: null,
    request_code: 'WAR-1',
    reviewed_at: null,
    reviewed_by: null,
    reviewed_by_id: null,
    serial_number: null,
    source: 'ADMIN_PORTAL',
    status: 'ACTIVATED',
    updated_at: new Date('2026-08-20T00:00:00.000Z'),
    vehicle_model: null,
    vehicle_plate: null,
    ward_code: '00001',
    ward_name: 'Phường A',
    warranty_code: 'WM-A',
    warranty_duration_months: null,
  };
}
