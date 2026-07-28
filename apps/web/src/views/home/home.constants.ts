import { productCatalog } from "@/src/constants/product-catalog.constants";
import { DEFAULT_HOME_HERO_SLIDES } from "@repo/shared/constants";

export const HOME_PRODUCT_CATEGORY_BATCH_SIZE = 30;

export interface HeroImageItem {
  id: string;
  src: string;
}

export const desktopHeroImages: HeroImageItem[] = DEFAULT_HOME_HERO_SLIDES.map(
  (slide) => ({
    id: slide.key,
    src: slide.desktopUrl,
  }),
);

export const mobileHeroImages: HeroImageItem[] = DEFAULT_HOME_HERO_SLIDES.map(
  (slide) => ({
    id: slide.key,
    src: slide.mobileUrl,
  }),
);

export const carBrands = [
  { name: "Audi", src: "/brands/audi.svg" },
  { name: "BMW", src: "/brands/bmw.png" },
  { name: "Ford", src: "/brands/ford.svg" },
  { name: "Genesis", src: "/brands/genesis.png" },
  { name: "Honda", src: "/brands/honda.svg" },
  { name: "Hyundai", src: "/brands/hyundai.svg" },
  { name: "Jaguar", src: "/brands/jaguar.svg" },
  { name: "Kia", src: "/brands/kia.svg" },
  {
    name: "Land Rover",
    src: "/brands/landrover.jpeg",
    className: "invert mix-blend-multiply",
  },
  { name: "Lexus", src: "/brands/lexus.svg" },
  { name: "Mercedes-Benz", src: "/brands/mercedes.svg" },
  { name: "Porsche", src: "/brands/porsche.svg" },
  { name: "Tesla", src: "/brands/tesla.svg" },
  { name: "Toyota", src: "/brands/toyota.svg" },
  { name: "Volkswagen", src: "/brands/volkswagen.svg" },
  { name: "Volvo", src: "/brands/volvo.svg" },
] as const;

export const FAQ_CONTENT_PAGE_SLUG = "cau-hoi-thuong-gap";

export const additionalProductCategories = [
  {
    id: "ledBulbs",
    image: "/product/product_1.jpg",
    itemCount: "12+",
  },
  {
    id: "biLed",
    image: "/product/product_3.jpg",
    itemCount: "18+",
  },
  {
    id: "auxLights",
    image: "/product/product_6.jpg",
    itemCount: "8+",
  },
  {
    id: "dashcam",
    image: "/product/product_9.jpg",
    itemCount: "10+",
  },
  {
    id: "tpms",
    image: "/product/product_10.jpg",
    itemCount: "6+",
  },
  {
    id: "androidBox",
    image: "/product/product_13.jpg",
    itemCount: "5+",
  },
  {
    id: "retroAccessories",
    image: "/product/product_14.jpg",
    itemCount: "15+",
  },
] as const;

export const featuredProducts = [
  {
    ...productCatalog.sp50,
    badgeClassName: "bg-premium-red",
    specs: {
      uv: productCatalog.sp50.film.uvBlock,
      ir: productCatalog.sp50.film.irBlock,
      vlt: productCatalog.sp50.film.vlt,
    },
  },
  {
    ...productCatalog.sp10,
    badgeClassName: "bg-deep-black",
    specs: {
      uv: productCatalog.sp10.film.uvBlock,
      ir: productCatalog.sp10.film.irBlock,
      vlt: productCatalog.sp10.film.vlt,
    },
  },
  {
    ...productCatalog.b55,
    badgeClassName: "bg-deep-gray",
    specs: {
      uv: productCatalog.b55.film.uvBlock,
      ir: productCatalog.b55.film.irBlock,
      vlt: productCatalog.b55.film.vlt,
    },
  },
] as const;

export const galleryCategories = [
  "ALL",
  "SP50",
  "SP10",
  "B55",
  "B15",
  "L50",
  "L15",
  "PRODUCTS",
  "CUSTOMERS",
] as const;

export const galleryImages = [
  { id: "lexusSp50", src: "/bg_1.jpg", category: "SP50" },
  {
    id: "vinfastSp10",
    src: "/guest/guest_2.jpg",
    category: "SP10",
  },
  {
    id: "rangeRoverB55",
    src: "/guest/guest_3.jpg",
    category: "B55",
  },
  {
    id: "mercedesB15",
    src: "/guest/guest_4.jpg",
    category: "B15",
  },
  {
    id: "bmwL50",
    src: "/product/product_1.jpg",
    category: "L50",
  },
  {
    id: "porscheL15",
    src: "/guest/guest_1.jpg",
    category: "L15",
  },
  {
    id: "productOne",
    src: "/product/product_1.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 1,
  },
  {
    id: "productTwo",
    src: "/product/product_2.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 2,
  },
  {
    id: "productThree",
    src: "/product/product_3.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 3,
  },
  {
    id: "productFour",
    src: "/product/product_4.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 4,
  },
  {
    id: "productFive",
    src: "/product/product_5.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 5,
  },
  {
    id: "productSix",
    src: "/product/product_6.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 6,
  },
  {
    id: "productSeven",
    src: "/product/product_7.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 7,
  },
  {
    id: "productEight",
    src: "/product/product_8.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 8,
  },
  {
    id: "productNine",
    src: "/product/product_9.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 9,
  },
  {
    id: "productTen",
    src: "/product/product_10.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 10,
  },
  {
    id: "productEleven",
    src: "/product/product_11.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 11,
  },
  {
    id: "productTwelve",
    src: "/product/product_12.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 12,
  },
  {
    id: "productThirteen",
    src: "/product/product_13.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 13,
  },
  {
    id: "productFourteen",
    src: "/product/product_14.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 14,
  },
  {
    id: "customerOne",
    src: "/guest/guest_1.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 1,
  },
  {
    id: "customerTwo",
    src: "/guest/guest_2.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 2,
  },
  {
    id: "customerThree",
    src: "/guest/guest_3.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 3,
  },
  {
    id: "customerFour",
    src: "/guest/guest_4.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 4,
  },
  {
    id: "customerFive",
    src: "/guest/guest_5.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 5,
  },
  {
    id: "customerSix",
    src: "/guest/guest_6.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 6,
  },
  {
    id: "customerSeven",
    src: "/guest/guest_7.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 7,
  },
  {
    id: "customerEight",
    src: "/guest/guest_8.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 8,
  },
  {
    id: "customerNine",
    src: "/guest/guest_9.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 9,
  },
] as const;
