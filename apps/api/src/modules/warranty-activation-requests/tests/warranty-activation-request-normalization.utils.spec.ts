import 'reflect-metadata';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { buildWarrantyActivationRequestFullAddress } from '@/modules/warranty-activation-requests/utils/warranty-activation-request-normalization.utils';

describe('warranty activation request address normalization', () => {
  it('appends the selected ward and province to a street detail', () => {
    expect(
      buildWarrantyActivationRequestFullAddress(createDto('12 Nguyen Trai')),
    ).toBe('12 Nguyen Trai, Ward One, Province One');
  });

  it('does not append a ward and province already present in the detail', () => {
    expect(
      buildWarrantyActivationRequestFullAddress(
        createDto('Ward One, Province One'),
      ),
    ).toBe('Ward One, Province One');
  });

  it('collapses repeated trailing ward and province groups', () => {
    expect(
      buildWarrantyActivationRequestFullAddress(
        createDto(
          'Ward One, Province One, Ward One, Province One, Ward One, Province One',
        ),
      ),
    ).toBe('Ward One, Province One');
  });

  it('does not silently rewrite an unseparated address detail', () => {
    const dto = createDto(
      'Khu Phố Hoàng Xá Phường Ninh Xá Thị Xã Thuận Thành Bắc Ninh',
    );
    dto.wardName = 'Phường Ninh Xá';
    dto.provinceName = 'Tỉnh Bắc Ninh';

    expect(buildWarrantyActivationRequestFullAddress(dto)).toBe(
      'Khu Phố Hoàng Xá Phường Ninh Xá Thị Xã Thuận Thành Bắc Ninh, Phường Ninh Xá, Tỉnh Bắc Ninh',
    );
  });
});

function createDto(addressDetail: string) {
  return Object.assign(new CreateWarrantyActivationRequestDto(), {
    addressDetail,
    customerName: 'Customer One',
    customerPhone: '0900000000',
    provinceCode: '01',
    provinceName: 'Province One',
    wardCode: '00001',
    wardName: 'Ward One',
  });
}
