export interface PrototypeHeroStat {
  id: string;
  value: string;
}

export interface EcosystemProductItem {
  id: string;
  badge: string;
  image: string;
  iconName: string;
}

export interface FilmLayerDetail {
  id: string;
  color: string;
  zOffset: number;
}

export interface MilestoneItem {
  id: string;
  year: string;
}

export interface CorporateStatItem {
  id: string;
  value: string;
  target: number;
  suffix: string;
}

export interface CorePillarItem {
  id: string;
  iconName: string;
  checkKeys: readonly string[];
}

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}
