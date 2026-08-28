import { createServer } from "node:http";
import process from "node:process";
import { pathToFileURL } from "node:url";

import puppeteer from "puppeteer-core";

const port = readPositiveNumber("PORT", 3001);
const host = process.env.HOST ?? "0.0.0.0";
const maxBodyBytes = readPositiveNumber("PDF_MAX_BODY_BYTES", 10 * 1024 * 1024);
const renderTimeoutMs = readPositiveNumber("PDF_RENDER_TIMEOUT_MS", 30_000);
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

async function readJsonBody(request) {
  const contentLength = Number(request.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
    throw createHttpError(413, "Request body too large");
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
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

async function renderPdf(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
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
    await page.setContent(html, {
      timeout: renderTimeoutMs,
      waitUntil: "load",
    });
    await page.evaluate(async () => document.fonts.ready);

    return Buffer.from(
      await page.pdf({
        preferCSSPageSize: true,
        printBackground: true,
      }),
    );
  } finally {
    await page.close();
  }
}

export function createRequestHandler({ render = renderPdf } = {}) {
  return async (request, response) => {
    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method !== "POST" || request.url !== "/render") {
      sendJson(response, 404, { message: "Not found" });
      return;
    }

    try {
      const body = await readJsonBody(request);
      if (!body || typeof body.html !== "string" || body.html.length === 0) {
        sendJson(response, 400, { message: "html is required" });
        return;
      }

      const pdf = await render(body.html);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-length": String(pdf.length),
        "content-type": "application/pdf",
      });
      response.end(pdf);
    } catch (error) {
      const statusCode =
        error && typeof error.statusCode === "number" ? error.statusCode : 500;
      console.error("PDF render failed:", error);
      sendJson(response, statusCode, {
        message:
          statusCode === 500
            ? "PDF render failed"
            : getErrorMessage(error, "PDF render failed"),
      });
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

async function shutdown(server, signal) {
  console.log(`Received ${signal}; stopping PDF renderer`);
  await new Promise((resolve) => server.close(resolve));
  const browser = await browserPromise?.catch(() => undefined);
  await browser?.close();
}

function startServer() {
  const server = createPdfRendererServer();

  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.once(signal, () => {
      void shutdown(server, signal).finally(() => process.exit(0));
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
