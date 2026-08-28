import { createServer } from "node:http";
import process from "node:process";
import { pathToFileURL } from "node:url";

import puppeteer from "puppeteer-core";

const port = readPositiveNumber("PORT", 3001);
const host = process.env.HOST ?? "0.0.0.0";
const maxBodyBytes = readPositiveNumber("PDF_MAX_BODY_BYTES", 10 * 1024 * 1024);
const renderTimeoutMs = readPositiveNumber("PDF_RENDER_TIMEOUT_MS", 45_000);
const renderConcurrency = readPositiveNumber("PDF_RENDER_CONCURRENCY", 2);
const renderQueueSize = readPositiveNumber("PDF_RENDER_QUEUE_SIZE", 8);
const executablePath =
  process.env.PUPPETEER_EXECUTABLE_PATH ?? "/usr/bin/chromium";

let browserPromise;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        args: [
          "--disable-dev-shm-usage",
          "--disable-setuid-sandbox",
          "--no-sandbox",
        ],
        executablePath,
        headless: true,
      })
      .then((browser) => {
        browser.once("disconnected", () => {
          browserPromise = undefined;
        });
        return browser;
      })
      .catch((error) => {
        browserPromise = undefined;
        throw error;
      });
  }

  return browserPromise;
}

async function readJsonBody(request, bodyLimit = maxBodyBytes) {
  const contentLength = Number(request.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > bodyLimit) {
    throw createHttpError(413, "Request body too large");
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > bodyLimit) {
      throw createHttpError(413, "Request body too large");
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw createHttpError(400, "Invalid JSON body");
  }
}

export function createPdfRenderer({
  getBrowser: acquireBrowser = getBrowser,
  timeoutMs = renderTimeoutMs,
} = {}) {
  /** @param {string} html @param {{signal?: AbortSignal}} [options] */
  return async function renderPdf(html, { signal: clientSignal } = {}) {
    const lifecycle = new AbortController();
    const timeoutError = createHttpError(504, "PDF render timed out");
    const clientAbortError = createHttpError(499, "Render request was aborted");
    const timeoutHandle = setTimeout(
      () => lifecycle.abort(timeoutError),
      timeoutMs,
    );
    const clientAbortHandler = () => lifecycle.abort(clientAbortError);
    clientSignal?.addEventListener("abort", clientAbortHandler, { once: true });
    if (clientSignal?.aborted) clientAbortHandler();

    /** @type {import("puppeteer-core").Page | undefined} */
    let page;
    let pageClosePromise;
    const closePage = async (currentPage = page) => {
      if (!currentPage) return;
      if (currentPage === page && pageClosePromise) {
        await pageClosePromise;
        return;
      }
      const closePromise = currentPage.close().catch(() => undefined);
      if (currentPage === page) pageClosePromise = closePromise;
      await closePromise;
    };
    const lifecycleAbortHandler = () => void closePage();
    lifecycle.signal.addEventListener("abort", lifecycleAbortHandler, {
      once: true,
    });

    try {
      const browser = await waitForLifecycle(
        acquireBrowser(),
        lifecycle.signal,
      );
      page = await waitForLifecycle(
        browser.newPage(),
        lifecycle.signal,
        closePage,
      );
      await waitForLifecycle(
        page.setJavaScriptEnabled(false),
        lifecycle.signal,
      );
      await waitForLifecycle(
        page.setRequestInterception(true),
        lifecycle.signal,
      );
      page.on("request", (request) => {
        const url = request.url();
        if (
          url === "about:blank" ||
          url.startsWith("data:") ||
          url.startsWith("blob:")
        ) {
          void request.continue();
          return;
        }
        void request.abort("blockedbyclient");
      });
      await waitForLifecycle(
        page.setContent(html, {
          timeout: timeoutMs,
          waitUntil: "load",
        }),
        lifecycle.signal,
      );
      await waitForLifecycle(
        page.evaluate(async () => document.fonts.ready),
        lifecycle.signal,
      );
      const pdf = await waitForLifecycle(
        page.pdf({
          preferCSSPageSize: true,
          printBackground: true,
        }),
        lifecycle.signal,
      );
      return Buffer.from(pdf);
    } finally {
      clearTimeout(timeoutHandle);
      clientSignal?.removeEventListener("abort", clientAbortHandler);
      lifecycle.signal.removeEventListener("abort", lifecycleAbortHandler);
      await closePage();
    }
  };
}

const renderPdf = createPdfRenderer();

async function waitForLifecycle(operation, signal, onLateResolve) {
  if (signal.aborted) throw getAbortReason(signal);

  let abortHandler;
  const abortOperation = new Promise((_, reject) => {
    abortHandler = () => reject(getAbortReason(signal));
    signal.addEventListener("abort", abortHandler, { once: true });
  });
  const guardedOperation = Promise.resolve(operation).then(async (value) => {
    if (signal.aborted) {
      await onLateResolve?.(value);
      throw getAbortReason(signal);
    }
    return value;
  });

  try {
    return await Promise.race([guardedOperation, abortOperation]);
  } finally {
    signal.removeEventListener("abort", abortHandler);
  }
}

function getAbortReason(signal) {
  return signal.reason instanceof Error
    ? signal.reason
    : createHttpError(499, "Render request was aborted");
}

function createRenderLimiter({ render, concurrency, queueSize }) {
  let active = 0;
  const queue = [];
  const drain = () => {
    while (active < concurrency && queue.length) {
      const job = queue.shift();
      job.signal?.removeEventListener("abort", job.abortHandler);
      if (job.signal?.aborted) {
        job.reject(createHttpError(499, "Render request was aborted"));
        continue;
      }
      active += 1;
      void Promise.resolve()
        .then(() => render(job.html, { signal: job.signal }))
        .then(job.resolve, job.reject)
        .finally(() => {
          active -= 1;
          drain();
        });
    }
  };
  return (html, options = {}) => {
    if (options.signal?.aborted) {
      return Promise.reject(createHttpError(499, "Render request was aborted"));
    }
    if (active >= concurrency && queue.length >= queueSize) {
      return Promise.reject(createHttpError(503, "PDF renderer is busy"));
    }
    return new Promise((resolve, reject) => {
      const job = {
        abortHandler: undefined,
        html,
        reject,
        resolve,
        signal: options.signal,
      };
      job.abortHandler = () => {
        const queueIndex = queue.indexOf(job);
        if (queueIndex < 0) return;
        queue.splice(queueIndex, 1);
        reject(createHttpError(499, "Render request was aborted"));
      };
      options.signal?.addEventListener("abort", job.abortHandler, {
        once: true,
      });
      queue.push(job);
      drain();
    });
  };
}

export function createRequestHandler({
  render = renderPdf,
  maxBodyBytes: bodyLimit = maxBodyBytes,
  renderConcurrency: concurrency = renderConcurrency,
  renderQueueSize: queueSize = renderQueueSize,
} = {}) {
  const limitedRender = createRenderLimiter({ concurrency, queueSize, render });
  return async (request, response) => {
    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method !== "POST" || request.url !== "/render") {
      sendJson(response, 404, { message: "Not found" });
      return;
    }

    let clientDisconnected = false;
    let abortController;
    const handleRequestAbort = () => {
      clientDisconnected = true;
      abortController?.abort();
    };
    const handleResponseClose = () => {
      if (!response.writableEnded) handleRequestAbort();
    };

    try {
      const body = await readJsonBody(request, bodyLimit);
      if (!body || typeof body.html !== "string" || body.html.length === 0) {
        sendJson(response, 400, { message: "html is required" });
        return;
      }

      abortController = new AbortController();
      request.once?.("aborted", handleRequestAbort);
      response.once?.("close", handleResponseClose);
      const pdf = await limitedRender(body.html, {
        signal: abortController.signal,
      });
      if (clientDisconnected || response.destroyed) return;
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-length": String(pdf.length),
        "content-type": "application/pdf",
      });
      response.end(pdf);
    } catch (error) {
      const statusCode =
        error && typeof error.statusCode === "number" ? error.statusCode : 500;
      if (clientDisconnected || response.destroyed) return;
      console.error("PDF render failed:", error);
      sendJson(response, statusCode, {
        message:
          statusCode === 500
            ? "PDF render failed"
            : getErrorMessage(error, "PDF render failed"),
      });
    } finally {
      request.off?.("aborted", handleRequestAbort);
      response.off?.("close", handleResponseClose);
    }
  };
}

export function createPdfRendererServer(options) {
  return createServer(createRequestHandler(options));
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": "application/json",
  });
  response.end(JSON.stringify(body));
}

function createHttpError(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

export function readPositiveNumber(name, fallback, environment = process.env) {
  const value = Number(environment[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
  return value;
}

function getErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export async function shutdownPdfRendererServer(
  server,
  signal = "test",
  { closeBrowser = closeSharedBrowser } = {},
) {
  console.log(`Received ${signal}; stopping PDF renderer`);
  await new Promise((resolve) => server.close(resolve));
  await closeBrowser();
}

async function closeSharedBrowser() {
  const browser = await browserPromise?.catch(() => undefined);
  await browser?.close();
}

function startServer() {
  const server = createPdfRendererServer();

  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.once(signal, () => {
      void shutdownPdfRendererServer(server, signal).finally(() =>
        process.exit(0),
      );
    });
  }

  server.listen(port, host, () => {
    console.log(`PDF renderer listening on http://${host}:${port}`);
  });
}

const entrypoint = process.argv[1];
if (entrypoint && pathToFileURL(entrypoint).href === import.meta.url) {
  startServer();
}
