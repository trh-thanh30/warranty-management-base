import type { storageBuckets } from "./system.constants";

export type StorageBucketKey = (typeof storageBuckets)[number]["key"];
