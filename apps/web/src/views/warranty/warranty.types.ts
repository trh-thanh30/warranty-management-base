export interface WarrantyLookupResult {
  serial: string;
  code: string;
  customerName: string;
  phone: string;
  address: string;
  carPlate: string;
  carModel: string;
  filmType: string;
  warrantyYears: string;
  installedDate: string;
  expiryDate: string;
  dealer: string;
  status: string;
  windshield: string;
  frontLeftGlass: string;
  frontRightGlass: string;
  rearLeftGlass: string;
  rearRightGlass: string;
  sunroof: string;
  rearGlass: string;
  notes: string;
}

export interface WarrantyTicketResult {
  ticketId: string;
  customerName: string;
  carPlate: string;
  issue: string;
  status: string;
  createdDate: string;
  assignedTechnician: string;
  step: number;
}
