import { access, readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listHtmlFiles(path));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path);
    }
  }

  return files;
}

function attributes(tag) {
  const values = new Map();
  const pattern = /\b([\w:-]+)\s*=\s*(["'])(.*?)\2/g;
  for (const match of tag.matchAll(pattern)) {
    values.set(match[1].toLowerCase(), match[3]);
  }
  return values;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => attributes(match[0]));
}

function isAbsoluteWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function outputRoute(outputDir, htmlFile) {
  const path = relative(outputDir, htmlFile).split(sep).join("/");
  if (path === "index.html") return "/";
  if (path.endsWith("/index.html")) return `/${path.slice(0, -"index.html".length)}`;
  return `/${path}`;
}

function localReference(value) {
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  return new URL(value, "https://local.invalid").pathname;
}

function targetFor(outputDir, pathname) {
  const relativePath = pathname.slice(1);
  return pathname.endsWith("/")
    ? join(outputDir, relativePath, "index.html")
    : join(outputDir, relativePath);
}

function isAssetReference(attribute, pathname) {
  return attribute === "src" || (extname(pathname) !== "" && extname(pathname) !== ".html");
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function checkMetadata(html, route, findings) {
  const canonicalValues = tags(html, "link")
    .filter((tag) => tag.get("rel")?.toLowerCase().split(/\s+/).includes("canonical"))
    .map((tag) => tag.get("href") ?? "");
  const socialValues = tags(html, "meta")
    .filter((tag) => (tag.get("property") ?? "").toLowerCase() === "og:image")
    .map((tag) => tag.get("content") ?? "");

  if (route !== "/404.html") {
    if (canonicalValues.length === 0) findings.add(`Missing canonical URL: ${route}`);
    for (const value of canonicalValues.filter((item) => !isAbsoluteWebUrl(item))) {
      findings.add(`Non-absolute canonical URL: ${value || "(empty)"} in ${route}`);
    }
  }

  if (socialValues.length === 0) findings.add(`Missing Open Graph image URL: ${route}`);
  for (const value of socialValues.filter((item) => !isAbsoluteWebUrl(item))) {
    findings.add(`Non-absolute Open Graph image URL: ${value || "(empty)"} in ${route}`);
  }

  if (route.startsWith("/essays/") && route.endsWith("/") && !tags(html, "meta").some(
    (tag) => (tag.get("property") ?? "").toLowerCase() === "article:published_time"
  )) {
    findings.add(`Public draft/upcoming essay route: ${route}`);
  }
}

async function checkReferences(html, outputDir, findings) {
  const pattern = /\b(href|src)\s*=\s*(["'])(.*?)\2/gi;
  for (const match of html.matchAll(pattern)) {
    const attribute = match[1].toLowerCase();
    const pathname = localReference(match[3]);
    if (!pathname || await exists(targetFor(outputDir, pathname))) continue;

    const label = isAssetReference(attribute, pathname) ? "Missing asset" : "Broken route";
    findings.add(`${label}: ${pathname}`);
  }
}

export async function verifyOutput(outputDir) {
  const absoluteOutputDir = resolve(outputDir);
  const findings = new Set();

  for (const htmlFile of await listHtmlFiles(absoluteOutputDir)) {
    const html = await readFile(htmlFile, "utf8");
    checkMetadata(html, outputRoute(absoluteOutputDir, htmlFile), findings);
    await checkReferences(html, absoluteOutputDir, findings);
  }

  if (findings.size > 0) {
    throw new Error(`Generated output verification failed:\n${[...findings].sort((left, right) => left.localeCompare(right)).join("\n")}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  verifyOutput(process.argv[2] ?? "dist").catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
