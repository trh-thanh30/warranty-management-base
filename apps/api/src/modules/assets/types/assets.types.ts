export const ASSET_ACCESS_TYPE = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  TEMP: 'TEMP',
} as const;

export type AssetAccessType =
  (typeof ASSET_ACCESS_TYPE)[keyof typeof ASSET_ACCESS_TYPE];
