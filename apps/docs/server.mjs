import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("./public", import.meta.url));
const host = process.env.DOCS_HOST || "127.0.0.1";
const port = Number.parseInt(process.env.DOCS_PORT || "8080", 10);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
};

function resolvePublicPath(urlPath) {
  const cleanPath = normalize(decodeURIComponent(urlPath.split("?")[0] || "/"));
  const relativePath =
    cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const filePath = join(rootDir, relativePath);

  if (!filePath.startsWith(rootDir)) {
    return null;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }

  const filePath = resolvePublicPath(request.url);

  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    const contentType =
      contentTypes[extname(filePath)] || "application/octet-stream";

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentType,
    });
    response.end(body);
  } catch {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Docs server running at http://${host}:${port}`);
});
