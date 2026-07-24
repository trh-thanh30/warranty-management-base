import type { Dealer } from "./dealers.types";

export const dealerFilterAll = "all" as const;

export const dealers: readonly Dealer[] = [
  {
    id: "1",
    name: "QUỐC ĐẠT AUTO CARE",
    address: "Tử Nê, Tân Lạc, Hoà Bình",
    phone: "0389 386 397",
    hoursKey: "daily",
    cityId: "hoaBinh",
    districtId: "tanLac",
    lat: 20.6133,
    lng: 105.2678,
  },
  {
    id: "2",
    name: "TITAN DETAILING",
    address:
      "Đường Hùng Vương, Khu Phố Phú Thọ 2, Phường Hoà Hiệp, Thị Xã Đông Hoà, Phú Yên",
    phone: "0905 123 456",
    hoursKey: "weekdays",
    cityId: "phuYen",
    districtId: "dongHoa",
    lat: 13.0189,
    lng: 109.3245,
  },
  {
    id: "3",
    name: "PANDA AUTO SHOWROOM CẦU GIẤY",
    address: "Số 18 Cầu Giấy, Phường Ngọc Khánh, Quận Cầu Giấy, Hà Nội",
    phone: "1900.9169",
    hoursKey: "daily",
    cityId: "hanoi",
    districtId: "cauGiay",
    lat: 21.0312,
    lng: 105.7944,
    isMainShowroom: true,
  },
  {
    id: "4",
    name: "FUJITEK DETAILING HÀ ĐÔNG",
    address: "Số 68 Quang Trung, Phường Quang Trung, Quận Hà Đông, Hà Nội",
    phone: "0988.123.456",
    hoursKey: "weekdays",
    cityId: "hanoi",
    districtId: "haDong",
    lat: 20.9708,
    lng: 105.7767,
  },
  {
    id: "5",
    name: "TRẠM BẢO HÀNH FUJITEK THỦ ĐỨC",
    address:
      "Số 102 Xa Lộ Hà Nội, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
    phone: "0909.888.999",
    hoursKey: "daily",
    cityId: "hoChiMinhCity",
    districtId: "thuDuc",
    lat: 10.8031,
    lng: 106.7314,
    isMainShowroom: true,
  },
  {
    id: "6",
    name: "AUTO365 ĐÀ NẴNG",
    address:
      "Số 42 Nguyễn Hữu Thọ, Phường Hòa Thuận Tây, Quận Hải Châu, Đà Nẵng",
    phone: "0935 999 888",
    hoursKey: "weekdays",
    cityId: "daNang",
    districtId: "haiChau",
    lat: 16.0471,
    lng: 108.2144,
  },
  {
    id: "7",
    name: "TÂY NGUYÊN AUTO CARE ĐẮK LẮK",
    address:
      "Số 125 Nguyễn Tất Thành, Phường Tân An, TP. Buôn Ma Thuột, Đắk Lắk",
    phone: "0947 778 899",
    hoursKey: "daily",
    cityId: "dakLak",
    districtId: "buonMaThuot",
    lat: 12.6865,
    lng: 108.0543,
  },
] as const;
