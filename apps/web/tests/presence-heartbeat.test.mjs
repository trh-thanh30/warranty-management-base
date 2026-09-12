import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { publicHttpClient } from "../src/lib/public-http-client.ts";
import { sendWebPresenceHeartbeat } from "../src/services/analytics/analytics.service.ts";
import {
  getPresenceSessionId,
  startPresenceHeartbeat,
} from "../../../packages/hooks/src/presence-heartbeat.utils.ts";

function setup(t) {
  const storage = new Map();
  const win = new EventTarget();
  const doc = new EventTarget();
  let now = 0;
  let tick;
  let cleared = false;
  Object.assign(win, {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    crypto: { randomUUID },
    setInterval: (callback, delay) => {
      assert.equal(delay, 30_000);
      tick = callback;
      return 1;
    },
    clearInterval: () => {
      cleared = true;
      tick = undefined;
    },
  });
  doc.visibilityState = "visible";
  for (const [key, value] of Object.entries({
    window: win,
    document: doc,
    navigator: { onLine: true },
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original);
      else delete globalThis[key];
    });
  }
  t.mock.method(Date, "now", () => now);
  return {
    win,
    doc,
    advance: (ms) => {
      now += ms;
      tick?.();
    },
    cleared: () => cleared,
  };
}

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

test("Web heartbeat calls the analytics endpoint with only the browser identity", async (t) => {
  const sessionId = randomUUID();
  const calls = [];
  t.mock.method(publicHttpClient, "post", async (...args) => {
    calls.push(args);
  });
  await sendWebPresenceHeartbeat(sessionId);
  assert.deepEqual(calls, [
    ["/analytics/presence/web/heartbeat", { sessionId }],
  ]);
});

test("presence reuses one browser UUID across mounts/tabs", (t) => {
  setup(t);
  const first = getPresenceSessionId();
  assert.match(first, /^[a-f0-9-]{36}$/);
  assert.equal(getPresenceSessionId(), first);
});

test("presence falls back without breaking when storage is blocked", (t) => {
  const env = setup(t);
  env.win.localStorage.getItem = () => {
    throw new Error("Storage blocked");
  };
  assert.match(getPresenceSessionId(), /^[a-f0-9-]{36}$/);
});

test("presence is safely disabled when the browser cannot generate an identity", (t) => {
  const env = setup(t);
  env.win.crypto.randomUUID = () => {
    throw new Error("Unavailable in insecure context");
  };
  assert.equal(getPresenceSessionId(), null);
  let calls = 0;
  const stop = startPresenceHeartbeat(async () => {
    calls++;
  });
  env.advance(30_000);
  assert.equal(calls, 0);
  stop();
});

test("presence throttles events, skips hidden/offline tabs and cleans up", async (t) => {
  const env = setup(t);
  const calls = [];
  const stop = startPresenceHeartbeat(async (id) => {
    calls.push(id);
  });
  assert.equal(calls.length, 1);
  await flush();
  env.doc.dispatchEvent(new Event("visibilitychange"));
  assert.equal(calls.length, 1);
  env.advance(30_000);
  assert.equal(calls.length, 2);
  await flush();
  env.doc.visibilityState = "hidden";
  env.advance(30_000);
  assert.equal(calls.length, 2);
  env.doc.visibilityState = "visible";
  navigator.onLine = false;
  env.advance(30_000);
  assert.equal(calls.length, 2);
  navigator.onLine = true;
  env.win.dispatchEvent(new Event("online"));
  assert.equal(calls.length, 3);
  stop();
  assert.equal(env.cleared(), true);
  env.advance(30_000);
  env.doc.dispatchEvent(new Event("visibilitychange"));
  assert.equal(calls.length, 3);
  assert.equal(new Set(calls).size, 1);
});

test("presence never overlaps requests and recovers from failure", async (t) => {
  const env = setup(t);
  let reject;
  let calls = 0;
  const stop = startPresenceHeartbeat(() => {
    calls++;
    return new Promise((_, rejectPromise) => {
      reject = rejectPromise;
    });
  });
  env.advance(30_000);
  assert.equal(calls, 1);
  reject(new Error("Network unavailable"));
  await flush();
  env.advance(30_000);
  assert.equal(calls, 2);
  reject(new Error("Network unavailable"));
  await flush();
  stop();
});
