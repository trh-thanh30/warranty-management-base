import type {
  FilmSpecifications,
  ProductCatalogItem,
} from "@/src/types/product-catalog.types";

export interface FilmProductCatalogItem extends ProductCatalogItem {
  film: FilmSpecifications;
}

export interface FilmDetailData extends FilmProductCatalogItem {
  priceRange: readonly [number, number];
  galleryImages: readonly string[];
  featureIds: readonly [0, 1, 2];
  vltNum: number;
  internalReflectionNum: number;
  externalReflectionNum: number;
  energyTransmissionNum: number;
  energyReflectionNum: number;
  energyAbsorptionNum: number;
  uvBlockNum: number;
  irBlockNum: number;
  heatTransferCoeffNum: number;
}
