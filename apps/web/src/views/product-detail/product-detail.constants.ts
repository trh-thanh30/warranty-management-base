import { productCatalog } from "@/src/constants/product-catalog.constants";
import type {
  FilmDetailData,
  FilmProductCatalogItem,
} from "./product-detail.types";

const sharedGalleryImages = [
  "/feat1.jpg",
  "/feat2.jpg",
  "/feat3.jpg",
  "/guest/guest_2.jpg",
  "/sanpham/product_1.jpg",
  "/sanpham/product_3.jpg",
  "/sanpham/product_6.jpg",
  "/guest/guest_3.jpg",
  "/guest/guest_4.jpg",
] as const;

function createFilmDetail(
  product: FilmProductCatalogItem,
  priceRange: readonly [number, number],
): FilmDetailData {
  return {
    ...product,
    priceRange,
    galleryImages: [
      product.image,
      ...sharedGalleryImages.filter((image) => image !== product.image),
    ],
    featureIds: [0, 1, 2],
    vltNum: product.film.vltNumber,
    internalReflectionNum: product.film.internalReflectionNumber,
    externalReflectionNum: product.film.externalReflectionNumber,
    energyTransmissionNum: product.film.energyTransmissionNumber,
    energyReflectionNum: product.film.energyReflectionNumber,
    energyAbsorptionNum: product.film.energyAbsorptionNumber,
    uvBlockNum: product.film.uvBlockNumber,
    irBlockNum: product.film.irBlockNumber,
    heatTransferCoeffNum: product.film.heatTransferCoeffNumber,
  };
}

export const filmCatalogMap = {
  sp50: createFilmDetail(productCatalog.sp50, [2_900_000, 5_800_000]),
  sp10: createFilmDetail(productCatalog.sp10, [2_900_000, 5_800_000]),
  b55: createFilmDetail(productCatalog.b55, [3_200_000, 6_400_000]),
  b15: createFilmDetail(productCatalog.b15, [3_200_000, 6_400_000]),
  l50: createFilmDetail(productCatalog.l50, [1_800_000, 3_600_000]),
  l15: createFilmDetail(productCatalog.l15, [1_800_000, 3_600_000]),
} as const;

export const defaultFilmProductId = "sp50";

export const spectrumImages = [
  "/feat1.jpg",
  "/feat2.jpg",
  "/feat3.jpg",
] as const;
