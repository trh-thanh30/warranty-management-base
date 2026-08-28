import assert from "node:assert/strict";
import test from "node:test";

import { createRequestHandler, readPositiveNumber } from "../server.mjs";

function createRequest({ body, method = "GET", url = "/health" } = {}) {
  const bodyBuffer = body === undefined ? undefined : Buffer.from(body);

  return {
    headers: bodyBuffer ? { "content-length": String(bodyBuffer.length) } : {},
    method,
    url,
    async *[Symbol.asyncIterator]() {
      if (bodyBuffer) {
        yield bodyBuffer;
      }
    },
  };
}

function createResponse() {
  return {
    body: undefined,
    headers: undefined,
    statusCode: undefined,
    end(body) {
      this.body = body;
    },
    writeHead(statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
  };
}

test("health endpoint reports readiness without launching Chromium", async () => {
  const handler = createRequestHandler();
  const response = createResponse();

  await handler(createRequest(), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { status: "ok" });
});

test("render endpoint validates its JSON payload", async () => {
  const handler = createRequestHandler();
  const response = createResponse();

  await handler(
    createRequest({ body: "not-json", method: "POST", url: "/render" }),
    response,
  );

  assert.equal(response.statusCode, 400);
  assert.deepEqual(JSON.parse(response.body), { message: "Invalid JSON body" });
});

test("render endpoint returns the injected PDF output", async () => {
  const pdf = Buffer.from("pdf-output");
  let receivedHtml;
  const handler = createRequestHandler({
    render: async (html) => {
      receivedHtml = html;
      return pdf;
    },
  });
  const response = createResponse();

  await handler(
    createRequest({
      body: JSON.stringify({ html: "<main>Certificate</main>" }),
      method: "POST",
      url: "/render",
    }),
    response,
  );

  assert.equal(receivedHtml, "<main>Certificate</main>");
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["content-type"], "application/pdf");
  assert.deepEqual(response.body, pdf);
});

test("positive environment numbers use fallback and reject invalid values", () => {
  assert.equal(readPositiveNumber("PORT", 3001, {}), 3001);
  assert.equal(readPositiveNumber("PORT", 3001, { PORT: "4100" }), 4100);
  assert.throws(
    () => readPositiveNumber("PORT", 3001, { PORT: "0" }),
    /PORT must be a positive number/,
  );
});
