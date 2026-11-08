import fs from "node:fs";
import path from "node:path";
import type { APIRoute, GetStaticPaths } from "astro";

const contentDataDir = path.join(process.cwd(), "content", "portfolio");

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath));
    }
  }
  return files;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = getAllFiles(contentDataDir);
  return files.map((file) => ({
    params: { path: file },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const filePath = params.path;
  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  const resolved = path.resolve(contentDataDir, filePath);
  // Prevent directory traversal
  if (!resolved.startsWith(contentDataDir) || !fs.existsSync(resolved)) {
    return new Response("Not found", { status: 404 });
  }

  const content = fs.readFileSync(resolved);
  const ext = path.extname(resolved).toLowerCase();
  const contentType =
    ext === ".json"
      ? "application/json; charset=utf-8"
      : ext === ".txt"
      ? "text/plain; charset=utf-8"
      : "application/octet-stream";

  return new Response(content, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
