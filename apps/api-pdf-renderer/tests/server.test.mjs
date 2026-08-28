import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import {
  createPdfRenderer,
  createRequestHandler,
  readPositiveNumber,
  shutdownPdfRendererServer,
} from "../server.mjs";

function createRequest({ body, method = "GET", url = "/health" } = {}) {
  const bodyBuffer = body === undefined ? undefined : Buffer.from(body);
  return Object.assign(new EventEmitter(), {
    headers: bodyBuffer ? { "content-length": String(bodyBuffer.length) } : {},
    method,
    url,
    async *[Symbol.asyncIterator]() {
      if (bodyBuffer) {
        yield bodyBuffer;
      }
    },
  });
}

function createResponse() {
  return Object.assign(new EventEmitter(), {
    body: undefined,
    headers: undefined,
    statusCode: undefined,
    writableEnded: false,
    end(body) {
      this.body = body;
      this.writableEnded = true;
    },
    writeHead(statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
  });
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

test("render endpoint rejects bodies over the configured limit", async () => {
  const handler = createRequestHandler({ maxBodyBytes: 8 });
  const response = createResponse();

  await handler(
    createRequest({
      body: JSON.stringify({ html: "too large" }),
      method: "POST",
      url: "/render",
    }),
    response,
  );

  assert.equal(response.statusCode, 413);
  assert.deepEqual(JSON.parse(response.body), {
    message: "Request body too large",
  });
});

test("render endpoint returns a safe error when rendering fails", async () => {
  const handler = createRequestHandler({
    render: async () => {
      throw new Error("chromium unavailable");
    },
  });
  const response = createResponse();

  await handler(
    createRequest({
      body: JSON.stringify({ html: "<main />" }),
      method: "POST",
      url: "/render",
    }),
    response,
  );

  assert.equal(response.statusCode, 500);
  assert.deepEqual(JSON.parse(response.body), { message: "PDF render failed" });
});

test("render endpoint reports overload when the queue is full", async () => {
  let release;
  const handler = createRequestHandler({
    renderConcurrency: 1,
    renderQueueSize: 0,
    render: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  const firstResponse = createResponse();
  const first = handler(
    createRequest({
      body: JSON.stringify({ html: "first" }),
      method: "POST",
      url: "/render",
    }),
    firstResponse,
  );
  await new Promise((resolve) => setImmediate(resolve));
  const secondResponse = createResponse();
  await handler(
    createRequest({
      body: JSON.stringify({ html: "second" }),
      method: "POST",
      url: "/render",
    }),
    secondResponse,
  );
  assert.equal(secondResponse.statusCode, 503);
  release(Buffer.from("pdf"));
  await first;
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

test("render timeout closes a Chromium page created after the timeout", async () => {
  let resolvePage;
  let closeCalls = 0;
  const page = {
    close: async () => {
      closeCalls += 1;
    },
  };
  const render = createPdfRenderer({
    getBrowser: async () => ({
      newPage: () =>
        new Promise((resolve) => {
          resolvePage = resolve;
        }),
    }),
    timeoutMs: 5,
  });

  await assert.rejects(render("<main>Certificate</main>"), (error) => {
    assert.equal(error.statusCode, 504);
    assert.equal(error.message, "PDF render timed out");
    return true;
  });

  resolvePage(page);
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(closeCalls, 1);
});

test("render timeout closes an active Chromium page", async () => {
  let closeCalls = 0;
  const page = {
    close: async () => {
      closeCalls += 1;
    },
    evaluate: async () => undefined,
    on: () => undefined,
    pdf: async () => Buffer.from("pdf"),
    setContent: () => new Promise(() => undefined),
    setJavaScriptEnabled: async () => undefined,
    setRequestInterception: async () => undefined,
  };
  const render = createPdfRenderer({
    getBrowser: async () => ({ newPage: async () => page }),
    timeoutMs: 5,
  });

  await assert.rejects(render("<main>Certificate</main>"), (error) => {
    assert.equal(error.statusCode, 504);
    return true;
  });

  assert.equal(closeCalls, 1);
});

for (const hangingStep of ["font loading", "PDF generation"]) {
  test(`render timeout covers ${hangingStep} and closes its page`, async () => {
    let closeCalls = 0;
    const never = () => new Promise(() => undefined);
    const page = {
      close: async () => {
        closeCalls += 1;
      },
      evaluate: hangingStep === "font loading" ? never : async () => undefined,
      on: () => undefined,
      pdf:
        hangingStep === "PDF generation"
          ? never
          : async () => Buffer.from("pdf"),
      setContent: async () => undefined,
      setJavaScriptEnabled: async () => undefined,
      setRequestInterception: async () => undefined,
    };
    const render = createPdfRenderer({
      getBrowser: async () => ({ newPage: async () => page }),
      timeoutMs: 5,
    });

    await assert.rejects(render("<main>Certificate</main>"), (error) => {
      assert.equal(error.statusCode, 504);
      return true;
    });

    assert.equal(closeCalls, 1);
  });
}

test("client disconnect aborts rendering and closes the active page", async () => {
  let closeCalls = 0;
  const page = {
    close: async () => {
      closeCalls += 1;
    },
    evaluate: async () => undefined,
    on: () => undefined,
    pdf: async () => Buffer.from("pdf"),
    setContent: () => new Promise(() => undefined),
    setJavaScriptEnabled: async () => undefined,
    setRequestInterception: async () => undefined,
  };
  const render = createPdfRenderer({
    getBrowser: async () => ({ newPage: async () => page }),
    timeoutMs: 1_000,
  });
  const request = createRequest({
    body: JSON.stringify({ html: "<main>Certificate</main>" }),
    method: "POST",
    url: "/render",
  });
  const response = createResponse();
  const handling = createRequestHandler({ render })(request, response);

  await new Promise((resolve) => setImmediate(resolve));
  request.emit("aborted");
  await handling;

  assert.equal(closeCalls, 1);
  assert.equal(response.statusCode, undefined);
});

test("render queue never exceeds configured concurrency", async () => {
  let active = 0;
  let maxActive = 0;
  const started = [];
  const releases = new Map();
  const handler = createRequestHandler({
    renderConcurrency: 2,
    renderQueueSize: 1,
    render: (html) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      started.push(html);
      return new Promise((resolve) => {
        releases.set(html, () => {
          active -= 1;
          resolve(Buffer.from("pdf"));
        });
      });
    },
  });
  const execute = (html) =>
    handler(
      createRequest({
        body: JSON.stringify({ html }),
        method: "POST",
        url: "/render",
      }),
      createResponse(),
    );

  const first = execute("first");
  const second = execute("second");
  const third = execute("third");
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(maxActive, 2);
  assert.deepEqual(started, ["first", "second"]);

  releases.get("first")();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(started, ["first", "second", "third"]);
  assert.equal(maxActive, 2);

  releases.get("second")();
  releases.get("third")();
  await Promise.all([first, second, third]);
});

test("client disconnect removes a queued render before it starts", async () => {
  let releaseFirst;
  const started = [];
  const handler = createRequestHandler({
    renderConcurrency: 1,
    renderQueueSize: 1,
    render: (html) => {
      started.push(html);
      if (html === "first") {
        return new Promise((resolve) => {
          releaseFirst = () => resolve(Buffer.from("pdf"));
        });
      }
      return Promise.resolve(Buffer.from("pdf"));
    },
  });
  const execute = (
    html,
    request = createRequest({
      body: JSON.stringify({ html }),
      method: "POST",
      url: "/render",
    }),
  ) => ({
    handling: handler(request, createResponse()),
    request,
  });

  const first = execute("first");
  await new Promise((resolve) => setImmediate(resolve));
  const second = execute("second");
  await new Promise((resolve) => setImmediate(resolve));
  second.request.emit("aborted");
  await second.handling;

  const third = execute("third");
  releaseFirst();
  await Promise.all([first.handling, third.handling]);

  assert.deepEqual(started, ["first", "third"]);
});

test("graceful shutdown stops the HTTP server and closes Chromium", async () => {
  let serverCloseCalls = 0;
  let browserCloseCalls = 0;
  const server = {
    close(callback) {
      serverCloseCalls += 1;
      callback();
    },
  };

  await shutdownPdfRendererServer(server, "test", {
    closeBrowser: async () => {
      browserCloseCalls += 1;
    },
  });

  assert.equal(serverCloseCalls, 1);
  assert.equal(browserCloseCalls, 1);
});
