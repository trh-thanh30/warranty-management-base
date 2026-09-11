import type {
  CreatePublicWarrantyActivationRequestBody,
  VietnamProvince,
  VietnamWard,
} from "@repo/shared";
import type { WarrantyActivationFormValues } from "./warranty-activation-form.schema";

export function toWarrantyActivationRequestBody({
  provinces,
  values,
  wards,
}: {
  provinces: VietnamProvince[];
  values: WarrantyActivationFormValues;
  wards: VietnamWard[];
}): CreatePublicWarrantyActivationRequestBody {
  const province = provinces.find(
    (item) => String(item.code) === values.provinceCode,
  );
  const ward = wards.find((item) => String(item.code) === values.wardCode);

  if (!province || !ward) {
    throw new Error("Selected activation address is invalid");
  }

  const customerEmail = values.customerEmail.trim().toLowerCase();

  return {
    addressDetail: values.addressDetail.trim(),
    customerEmail,
    customerName: values.customerName.trim(),
    customerPhone: values.customerPhone.trim(),
    installedAt: new Date(values.installedAt).toISOString(),
    provinceCode: values.provinceCode,
    provinceName: province.name,
    vehiclePlate: values.vehiclePlate.trim().toUpperCase(),
    wardCode: values.wardCode,
    wardName: ward.name,
    warrantyCode: values.warrantyCode.trim().toUpperCase(),
  };
}
