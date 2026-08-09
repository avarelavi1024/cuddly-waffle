import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "./site.js";

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

function startTags(html) {
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/(<(script|style)\b[^>]*>)[\s\S]*?<\/\2\s*>/gi, "$1");
  return [...markup.matchAll(/<([a-z][\w:-]*)\b[^>]*>/gi)].map((match) => ({
    name: match[1].toLowerCase(),
    attributes: attributes(match[0])
  }));
}

function tags(html, name) {
  return startTags(html).filter((tag) => tag.name === name).map((tag) => tag.attributes);
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

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function checkSocialImage(value, outputDir, findings) {
  if (!isAbsoluteWebUrl(value)) return;
  const url = new URL(value);
  if (!url.pathname.toLowerCase().endsWith(".png")) {
    findings.add(`Open Graph image must be PNG: ${value}`);
    return;
  }
  if (url.origin !== site.origin) return;

  const target = targetFor(outputDir, url.pathname);
  if (!await isFile(target)) {
    findings.add(`Missing asset: ${url.pathname}`);
    return;
  }

  const bytes = await readFile(target);
  const isPng = bytes.length >= 24
    && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    && bytes.subarray(12, 16).toString("ascii") === "IHDR";
  if (!isPng) {
    findings.add(`Invalid social image: ${url.pathname} (expected PNG)`);
    return;
  }

  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== 1200 || height !== 630) {
    findings.add(`Invalid social image dimensions: ${url.pathname} (expected 1200x630, got ${width}x${height})`);
  }
}

async function checkMetadata(html, route, outputDir, findings) {
  const canonicalValues = tags(html, "link")
    .filter((tag) => tag.get("rel")?.toLowerCase().split(/\s+/).includes("canonical"))
    .map((tag) => tag.get("href") ?? "");
  const socialValues = tags(html, "meta")
    .filter((tag) => (tag.get("property") ?? "").toLowerCase() === "og:image")
    .map((tag) => tag.get("content") ?? "");

  if (route !== "/404.html" && canonicalValues.length === 0) {
    findings.add(`Missing canonical URL: ${route}`);
  }
  for (const value of canonicalValues.filter((item) => !isAbsoluteWebUrl(item))) {
    findings.add(`Non-absolute canonical URL: ${value || "(empty)"} in ${route}`);
  }

  if (socialValues.length === 0) findings.add(`Missing Open Graph image URL: ${route}`);
  for (const value of socialValues) {
    if (!isAbsoluteWebUrl(value)) {
      findings.add(`Non-absolute Open Graph image URL: ${value || "(empty)"} in ${route}`);
    }
    await checkSocialImage(value, outputDir, findings);
  }

  if (route.startsWith("/essays/") && route.endsWith("/") && !tags(html, "meta").some(
    (tag) => (tag.get("property") ?? "").toLowerCase() === "article:published_time"
  )) {
    findings.add(`Public draft/upcoming essay route: ${route}`);
  }
}

async function checkReferences(html, outputDir, findings) {
  for (const tag of startTags(html)) {
    for (const attribute of ["href", "src"]) {
      const pathname = localReference(tag.attributes.get(attribute) ?? "");
      if (!pathname || await isFile(targetFor(outputDir, pathname))) continue;

      const label = isAssetReference(attribute, pathname) ? "Missing asset" : "Broken route";
      findings.add(`${label}: ${pathname}`);
    }
  }
}

export async function verifyOutput(outputDir) {
  const absoluteOutputDir = resolve(outputDir);
  const findings = new Set();

  for (const htmlFile of await listHtmlFiles(absoluteOutputDir)) {
    const html = await readFile(htmlFile, "utf8");
    await checkMetadata(html, outputRoute(absoluteOutputDir, htmlFile), absoluteOutputDir, findings);
    await checkReferences(html, absoluteOutputDir, findings);
  }

  if (findings.size > 0) {
    const sortedFindings = [...findings].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
    throw new Error(`Generated output verification failed:\n${sortedFindings.join("\n")}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  verifyOutput(process.argv[2] ?? "dist").catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
