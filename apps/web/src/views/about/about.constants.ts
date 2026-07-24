export const aboutGalleryCategories = [
  "all",
  "technology",
  "installation",
  "showroom",
] as const;

export const aboutGalleryItems = [
  { id: "technologyLab", category: "technology", src: "/feat1.jpg" },
  { id: "filmStructure", category: "technology", src: "/feat2.jpg" },
  {
    id: "installationOne",
    category: "installation",
    src: "/khachhang/510962789_708623938540711_2735951356818959986_n.jpg",
  },
  {
    id: "installationTwo",
    category: "installation",
    src: "/khachhang/515494314_715431447859960_9183864286063818207_n.jpg",
  },
  { id: "showroomHanoi", category: "showroom", src: "/hi.jpg" },
  { id: "premiumVehicle", category: "installation", src: "/bg.jpg" },
] as const;

export const aboutValues = ["technology", "luxury", "commitment"] as const;

export const aboutFactoryFacts = ["area", "countries", "quality"] as const;

export const aboutFilmLayerDetails = [
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

export const aboutOriginTimelineIds = [
  "research",
  "production",
  "qualityControl",
] as const;

export const aboutStatItems = [
  { id: "uvIr", value: "99%", target: 99, suffix: "%" },
  { id: "origin", value: "100%", target: 100, suffix: "%" },
  { id: "coreTech", value: "2", target: 2, suffix: "" },
  { id: "signal", value: "0", target: 0, suffix: "" },
] as const;

export const aboutPerformanceItems = [
  "cool",
  "uvProtect",
  "glare",
  "energy",
] as const;

export const aboutSafetyItems = ["b1", "b2", "b3"] as const;

export const aboutCustomerValueItems = ["b1", "b2", "b3"] as const;

export const aboutCompassNeedleVariants = {
  hover: { rotate: 360 },
} as const;
