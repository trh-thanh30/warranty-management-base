import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.join(process.cwd(), "dist");
const markerPath = path.join(outputDirectory, ".build");

await mkdir(outputDirectory, { recursive: true });
await writeFile(markerPath, "Build completed.\n", "utf8");
