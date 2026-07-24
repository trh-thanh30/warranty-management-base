import { productCatalog } from "@/src/constants/product-catalog.constants";
import type {
  FilmDetailData,
  FilmProductCatalogItem,
} from "./product-detail.types";

const sharedGalleryImages = [
  "/feat1.jpg",
  "/feat2.jpg",
  "/feat3.jpg",
  "/khachhang/510962789_708623938540711_2735951356818959986_n.jpg",
  "/sanpham/491785581_659103893492716_3763861878564125633_n.jpg",
  "/sanpham/660867658_932031392866630_1775108430541815111_n.jpg",
  "/sanpham/680213145_948050377931398_4658545440541295332_n.jpg",
  "/khachhang/515494314_715431447859960_9183864286063818207_n.jpg",
  "/khachhang/518450802_727834709952967_2678400354888596450_n.jpg",
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
