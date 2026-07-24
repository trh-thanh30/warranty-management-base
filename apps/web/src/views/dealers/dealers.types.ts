export type DealerCityId =
  | "hoaBinh"
  | "phuYen"
  | "hanoi"
  | "hoChiMinhCity"
  | "daNang"
  | "dakLak";

export interface Dealer {
  id: string;
  name: string;
  address: string;
  phone: string;
  hoursKey: "daily" | "weekdays";
  cityId: DealerCityId;
  districtId: string;
  lat: number;
  lng: number;
  isMainShowroom?: boolean;
}
