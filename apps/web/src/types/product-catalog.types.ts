export type CatalogCategory =
  | "film"
  | "ledBulbs"
  | "biLed"
  | "auxLights"
  | "dashcam"
  | "tpms"
  | "androidBox"
  | "retroAccessories";

export type CatalogFilterCategory = "all" | CatalogCategory;

export type ProductMetricKey =
  | "vlt"
  | "internalReflection"
  | "externalReflection"
  | "energyTransmission"
  | "energyReflection"
  | "energyAbsorption"
  | "uvBlock"
  | "irBlock"
  | "heatTransferCoeff";

export type ProductSpecKey =
  | ProductMetricKey
  | "power"
  | "colorTemperature"
  | "waterResistance"
  | "luminousFlux"
  | "beamDistance"
  | "resolution"
  | "sensor"
  | "powerSource"
  | "alertMode"
  | "configuration"
  | "operatingSystem"
  | "control"
  | "application"
  | "ledChip"
  | "connectivity"
  | "valveType";

export interface CatalogHighlightSpec {
  id: ProductSpecKey;
  value: string;
  translateValue?: boolean;
}

export interface FilmSpecifications {
  placement: "windshield" | "sideRear";
  vlt: string;
  vltNumber: number;
  internalReflection: string;
  internalReflectionNumber: number;
  externalReflection: string;
  externalReflectionNumber: number;
  energyTransmission: string;
  energyTransmissionNumber: number;
  energyReflection: string;
  energyReflectionNumber: number;
  energyAbsorption: string;
  energyAbsorptionNumber: number;
  uvBlock: string;
  uvBlockNumber: number;
  irBlock: string;
  irBlockNumber: number;
  heatTransferCoeff: string;
  heatTransferCoeffNumber: number;
  structure: string;
  colorId: "skyBlue" | "darkCharcoal" | "charcoalBlue" | "smokeGray" | "black";
}

export interface ProductCatalogItem {
  id: string;
  slug: string;
  detailKey: string;
  code: string;
  category: CatalogCategory;
  image: string;
  warrantyYears: number;
  highlightSpecs: readonly CatalogHighlightSpec[];
  film?: FilmSpecifications;
}
