export interface AddressSearchResult {
  display_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface NominatimAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  path?: string;
  residential?: string;
  suburb?: string;
  neighbourhood?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country_code?: string;
}

export interface NominatimSearchItem {
  display_name: string;
  class?: string;
  type?: string;
  address?: NominatimAddress;
}
