import { productCatalog } from "@/src/constants/product-catalog.constants";

export const carHeroImages = [
  { id: "primary", src: "/bg.jpg" },
  { id: "technology", src: "/bg_2.jpg" },
  { id: "protection", src: "/bg_3.jpg" },
] as const;

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

export const faqItems = [
  "warrantyDuration",
  "lookup",
  "sputterDifference",
  "installationTime",
  "choosePackage",
  "aftercare",
  "signalSafety",
  "warrantySupport",
] as const;

export const additionalProductCategories = [
  {
    id: "ledBulbs",
    image: "/sanpham/491785581_659103893492716_3763861878564125633_n.jpg",
    itemCount: "12+",
  },
  {
    id: "biLed",
    image: "/sanpham/660867658_932031392866630_1775108430541815111_n.jpg",
    itemCount: "18+",
  },
  {
    id: "auxLights",
    image: "/sanpham/680213145_948050377931398_4658545440541295332_n.jpg",
    itemCount: "8+",
  },
  {
    id: "dashcam",
    image: "/sanpham/708866764_974343475302088_6969437192664409450_n.jpg",
    itemCount: "10+",
  },
  {
    id: "tpms",
    image: "/sanpham/722859751_989791480423954_4718269048704660286_n.jpg",
    itemCount: "6+",
  },
  {
    id: "androidBox",
    image: "/sanpham/742129847_1011122928290809_2932987533225347117_n.jpg",
    itemCount: "5+",
  },
  {
    id: "retroAccessories",
    image: "/sanpham/750632674_1021370440599391_2260673870932429076_n.jpg",
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
  { id: "lexusSp50", src: "/bg.jpg", category: "SP50" },
  {
    id: "vinfastSp10",
    src: "/khachhang/510962789_708623938540711_2735951356818959986_n.jpg",
    category: "SP10",
  },
  {
    id: "rangeRoverB55",
    src: "/khachhang/515494314_715431447859960_9183864286063818207_n.jpg",
    category: "B55",
  },
  {
    id: "mercedesB15",
    src: "/khachhang/518450802_727834709952967_2678400354888596450_n.jpg",
    category: "B15",
  },
  {
    id: "bmwL50",
    src: "/sanpham/491785581_659103893492716_3763861878564125633_n.jpg",
    category: "L50",
  },
  {
    id: "porscheL15",
    src: "/khachhang/509441632_708624408540664_6816446526600313458_n.jpg",
    category: "L15",
  },
  {
    id: "productOne",
    src: "/sanpham/491785581_659103893492716_3763861878564125633_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 1,
  },
  {
    id: "productTwo",
    src: "/sanpham/493207408_666067026129736_5785984494280835462_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 2,
  },
  {
    id: "productThree",
    src: "/sanpham/660867658_932031392866630_1775108430541815111_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 3,
  },
  {
    id: "productFour",
    src: "/sanpham/667593305_938070538929382_7923475188557062827_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 4,
  },
  {
    id: "productFive",
    src: "/sanpham/668735718_935085782561191_912310026927575912_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 5,
  },
  {
    id: "productSix",
    src: "/sanpham/680213145_948050377931398_4658545440541295332_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 6,
  },
  {
    id: "productSeven",
    src: "/sanpham/680678136_951462554256847_7236327126217463146_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 7,
  },
  {
    id: "productEight",
    src: "/sanpham/681996355_951466384256464_1676689774949903356_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 8,
  },
  {
    id: "productNine",
    src: "/sanpham/708866764_974343475302088_6969437192664409450_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 9,
  },
  {
    id: "productTen",
    src: "/sanpham/722859751_989791480423954_4718269048704660286_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 10,
  },
  {
    id: "productEleven",
    src: "/sanpham/733539030_1001552672581168_801810398580059378_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 11,
  },
  {
    id: "productTwelve",
    src: "/sanpham/739420176_1009465235123245_54772665120959991_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 12,
  },
  {
    id: "productThirteen",
    src: "/sanpham/742129847_1011122928290809_2932987533225347117_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 13,
  },
  {
    id: "productFourteen",
    src: "/sanpham/750632674_1021370440599391_2260673870932429076_n.jpg",
    category: "PRODUCTS",
    kind: "products",
    index: 14,
  },
  {
    id: "customerOne",
    src: "/khachhang/509441632_708624408540664_6816446526600313458_n.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 1,
  },
  {
    id: "customerTwo",
    src: "/khachhang/510962789_708623938540711_2735951356818959986_n.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 2,
  },
  {
    id: "customerThree",
    src: "/khachhang/515494314_715431447859960_9183864286063818207_n.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 3,
  },
  {
    id: "customerFour",
    src: "/khachhang/518450802_727834709952967_2678400354888596450_n.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 4,
  },
  {
    id: "customerFive",
    src: "/khachhang/519054906_732988929437545_968487580203790719_n.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 5,
  },
  {
    id: "customerSix",
    src: "/khachhang/523310088_732989089437529_8608938970161132500_n.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 6,
  },
  {
    id: "customerSeven",
    src: "/khachhang/523326629_732989069437531_3797709217174348137_n.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 7,
  },
  {
    id: "customerEight",
    src: "/khachhang/524121043_732989086104196_2355143299812590419_n.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 8,
  },
  {
    id: "customerNine",
    src: "/khachhang/526182504_740849221984849_6142863754935644413_n.jpg",
    category: "CUSTOMERS",
    kind: "customers",
    index: 9,
  },
] as const;
