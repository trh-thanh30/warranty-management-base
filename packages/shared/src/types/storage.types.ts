export type StorageAlertLevel =
  | "UNCONFIGURED"
  | "NORMAL"
  | "WARNING"
  | "CRITICAL"
  | "EMERGENCY";

export type StorageBucketUsage = {
  bytes: number;
  objects: number;
};

export type StorageUsageSummary = {
  alertLevel: StorageAlertLevel;
  buckets: {
    private: StorageBucketUsage;
    public: StorageBucketUsage;
    temp: StorageBucketUsage;
  };
  capacityBytes: number | null;
  certificates: {
    averageBytes: number;
    bytes: number;
    objects: number;
    orphanedBytes: number;
    orphanedObjects: number;
  };
  totalBytes: number;
  totalObjects: number;
  usagePercent: number | null;
};
