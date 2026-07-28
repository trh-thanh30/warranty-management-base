import assert from "node:assert/strict";
import test from "node:test";
import { createHttpClient } from "../src/http/axios-client.ts";

test("returns the API body after the response interceptor", async () => {
  const payload = {
    success: true,
    data: [{ id: "category-1" }],
  };
  const client = createHttpClient();

  const response = await client.get<typeof payload>("/categories", {
    adapter: async (config) => ({
      config,
      data: payload,
      headers: {},
      status: 200,
      statusText: "OK",
    }),
  });

  assert.deepEqual(response, payload);
});
