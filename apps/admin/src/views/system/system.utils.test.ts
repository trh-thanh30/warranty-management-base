import assert from "node:assert/strict";
import test from "node:test";
import {
  clampPercentage,
  formatBytes,
  formatCount,
  getStorageBucketDistribution,
} from "./system.utils.ts";

test("formats storage bytes with a readable binary unit", () => {
  assert.equal(formatBytes(5 * 1024 * 1024, "en"), "5 MB");
  assert.equal(formatBytes(0, "en"), "0 B");
});

test("formats object counts using the active locale", () => {
  assert.equal(formatCount(1234, "en"), "1,234");
});

test("clamps capacity progress to its visual range", () => {
  assert.equal(clampPercentage(null), 0);
  assert.equal(clampPercentage(-5), 0);
  assert.equal(clampPercentage(84.5), 84.5);
  assert.equal(clampPercentage(120), 100);
});

test("calculates storage distribution for every bucket", () => {
  const distribution = getStorageBucketDistribution({
    alertLevel: "NORMAL",
    buckets: {
      private: { bytes: 300, objects: 3 },
      public: { bytes: 600, objects: 6 },
      temp: { bytes: 100, objects: 1 },
    },
    capacityBytes: 2000,
    certificates: {
      averageBytes: 100,
      bytes: 300,
      objects: 3,
      orphanedBytes: 0,
      orphanedObjects: 0,
    },
    totalBytes: 1000,
    totalObjects: 10,
    usagePercent: 50,
  });

  assert.deepEqual(
    distribution.map(({ key, share }) => ({ key, share })),
    [
      { key: "public", share: 60 },
      { key: "private", share: 30 },
      { key: "temp", share: 10 },
    ],
  );
});

test("returns zero shares when storage is empty", () => {
  const distribution = getStorageBucketDistribution({
    alertLevel: "UNCONFIGURED",
    buckets: {
      private: { bytes: 0, objects: 0 },
      public: { bytes: 0, objects: 0 },
      temp: { bytes: 0, objects: 0 },
    },
    capacityBytes: null,
    certificates: {
      averageBytes: 0,
      bytes: 0,
      objects: 0,
      orphanedBytes: 0,
      orphanedObjects: 0,
    },
    totalBytes: 0,
    totalObjects: 0,
    usagePercent: null,
  });

  assert.deepEqual(
    distribution.map(({ share }) => share),
    [0, 0, 0],
  );
});
