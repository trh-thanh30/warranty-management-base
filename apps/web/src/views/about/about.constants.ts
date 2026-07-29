import type {
  EcosystemProductItem,
  FilmLayerDetail,
  MilestoneItem,
  CorePillarItem,
  TestimonialItem,
} from "./about.types";

export const aboutHeroBorderStats = [
  { id: "uvIr", value: "99%" },
  { id: "origin", value: "100%" },
  { id: "warranty", value: "10 NĂM" },
] as const;

export const aboutEcosystemProducts: readonly EcosystemProductItem[] = [
  {
    id: "film",
    badge: "Sputtering & Nano Ceramic",
    image: "/feat1.jpg",
    iconName: "Shield",
  },
  {
    id: "lighting",
    badge: "Bi LED & LED Gầm Fujitek",
    image: "/feat2.jpg",
    iconName: "Zap",
  },
  {
    id: "dashcam",
    badge: "Ghi Hình 4K Đêm Sắc Nét",
    image: "/guest/guest_2.jpg",
    iconName: "Camera",
  },
  {
    id: "tpms",
    badge: "Cảnh Báo Áp Suất Realtime",
    image: "/guest/guest_3.jpg",
    iconName: "Gauge",
  },
] as const;

export const aboutFilmLayerDetails: readonly FilmLayerDetail[] = [
  { id: "scratchCoat", color: "var(--color-slate-blue)", zOffset: 120 },
  { id: "sputterMetal", color: "var(--color-danger-red)", zOffset: 80 },
  { id: "opticalBase", color: "var(--color-silver-fog)", zOffset: 40 },
  { id: "nanoCeramic", color: "var(--color-premium-red)", zOffset: 0 },
  { id: "adhesive", color: "var(--color-dark-charcoal)", zOffset: -40 },
] as const;

export const aboutFilmLayerIds = [
  "scratchCoat",
  "sputterMetal",
  "opticalBase",
  "nanoCeramic",
  "adhesive",
] as const;

export const aboutMilestones: readonly MilestoneItem[] = [
  { id: "rdJapan", year: "2015" },
  { id: "launchVietnam", year: "2018" },
  { id: "ewarrantyRelease", year: "2021" },
  { id: "networkExpansion", year: "2024" },
] as const;

export const aboutCorePillars: readonly CorePillarItem[] = [
  {
    id: "pioneerTech",
    iconName: "Cpu",
    checkKeys: ["nanoTech", "sputterTech", "signalFriendly"],
  },
  {
    id: "japaneseQuality",
    iconName: "ShieldCheck",
    checkKeys: ["cleanroomClass", "qaQc100", "isoStandard"],
  },
  {
    id: "dedicatedService",
    iconName: "HeartHandshake",
    checkKeys: ["ewarrantyDigital", "support247", "dealerNetwork"],
  },
] as const;

export const aboutCraftsmanshipSpecs = [
  "research",
  "cleanroom",
  "inspection",
] as const;

export const aboutCraftsmanshipStats = [
  { id: "qaQc", value: "100%" },
  { id: "cleanroom", value: "Class 1000" },
  { id: "iso", value: "ISO 9001" },
  { id: "experience", value: "10+" },
] as const;

export const aboutNetworkStats = [
  { id: "dealers", value: "200+" },
  { id: "provinces", value: "63" },
  { id: "warrantyYears", value: "10 NĂM" },
  { id: "support", value: "24/7" },
] as const;

export const aboutPerformanceItems = [
  "heatRejection",
  "uvProtection",
  "clarity",
  "durability",
] as const;

export const aboutB2BBenefits = [
  "discount",
  "training",
  "marketing",
  "warranty",
] as const;

export const aboutTestimonials: readonly TestimonialItem[] = [
  {
    id: "dealerHanoi",
    author: "Anh Trần Đức Thành",
    role: "Giám đốc Panda Auto Showroom Hà Nội",
    avatar: "/guest/guest_2.jpg",
    rating: 5,
  },
  {
    id: "dealerSaigon",
    author: "Anh Nguyễn Quốc Huy",
    role: "Chủ Trung tâm Auto Care Sài Gòn",
    avatar: "/guest/guest_3.jpg",
    rating: 5,
  },
] as const;
