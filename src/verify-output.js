import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { site } from "./site.js";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const REQUIRED_PROPERTY_METADATA = ["og:title", "og:description", "og:type", "og:url", "og:image"];
const REQUIRED_NAMED_METADATA = ["twitter:card", "twitter:title", "twitter:description", "twitter:image"];
const PNG_BIT_DEPTHS = new Map([
  [0, new Set([1, 2, 4, 8, 16])],
  [2, new Set([8, 16])],
  [3, new Set([1, 2, 4, 8])],
  [4, new Set([8, 16])],
  [6, new Set([8, 16])]
]);
const PNG_CHANNELS = new Map([[0, 1], [2, 3], [3, 1], [4, 2], [6, 4]]);
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return crc >>> 0;
});

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

function crc32(parts) {
  let crc = 0xffffffff;
  for (const bytes of parts) {
    for (const byte of bytes) {
      crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function inspectPng(bytes) {
  if (bytes.length < PNG_SIGNATURE.length || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) return undefined;

  let offset = 8;
  let header;
  let paletteSeen = false;
  let imageDataSeen = false;
  let imageDataEnded = false;
  const imageData = [];

  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) return undefined;
    const length = bytes.readUInt32BE(offset);
    const typeBytes = bytes.subarray(offset + 4, offset + 8);
    const type = typeBytes.toString("ascii");
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    if (!/^[A-Za-z]{4}$/.test(type) || dataEnd < dataStart || chunkEnd > bytes.length) return undefined;
    const data = bytes.subarray(dataStart, dataEnd);
    if (bytes.readUInt32BE(dataEnd) !== crc32([typeBytes, data])) return undefined;

    if (!header && type !== "IHDR") return undefined;
    if (imageDataSeen && type !== "IDAT") imageDataEnded = true;

    if (type === "IHDR") {
      if (header || length !== 13) return undefined;
      const width = data.readUInt32BE(0);
      const height = data.readUInt32BE(4);
      const bitDepth = data[8];
      const colorType = data[9];
      const compression = data[10];
      const filter = data[11];
      const interlace = data[12];
      if (width === 0 || height === 0 || !PNG_BIT_DEPTHS.get(colorType)?.has(bitDepth)) return undefined;
      if (compression !== 0 || filter !== 0 || ![0, 1].includes(interlace)) return undefined;
      header = { width, height, bitDepth, colorType, interlace };
    } else if (type === "PLTE") {
      if (imageDataSeen || length === 0 || length > 768 || length % 3 !== 0) return undefined;
      paletteSeen = true;
    } else if (type === "IDAT") {
      if (!header || imageDataEnded || (header.colorType === 3 && !paletteSeen)) return undefined;
      imageDataSeen = true;
      imageData.push(data);
    } else if (type === "IEND") {
      if (length !== 0 || !header || !imageDataSeen || chunkEnd !== bytes.length) return undefined;
      try {
        const raster = inflateSync(Buffer.concat(imageData));
        if (header.interlace === 0) {
          const channels = PNG_CHANNELS.get(header.colorType);
          const rowLength = Math.ceil((header.width * channels * header.bitDepth) / 8) + 1;
          if (raster.length !== rowLength * header.height) return undefined;
          for (let row = 0; row < header.height; row += 1) {
            if (raster[row * rowLength] > 4) return undefined;
          }
        } else if (raster.length === 0) {
          return undefined;
        }
      } catch {
        return undefined;
      }
      return { width: header.width, height: header.height };
    } else if (type[0] === type[0].toUpperCase()) {
      return undefined;
    }

    offset = chunkEnd;
  }

  return undefined;
}

async function checkSocialImage(value, route, outputDir, findings, label = "Open Graph") {
  if (!isAbsoluteWebUrl(value)) return;
  const url = new URL(value);
  if (url.origin !== site.origin) {
    findings.add(`Off-origin ${label} image URL: ${value} in ${route}`);
    return;
  }
  if (!url.pathname.toLowerCase().endsWith(".png")) {
    findings.add(`${label} image must be PNG: ${value}`);
    return;
  }

  const target = targetFor(outputDir, url.pathname);
  if (!await isFile(target)) {
    findings.add(`Missing asset: ${url.pathname}`);
    return;
  }

  const bytes = await readFile(target);
  if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    findings.add(`Invalid social image: ${url.pathname} (expected PNG)`);
    return;
  }
  const png = inspectPng(bytes);
  if (!png) {
    findings.add(`Invalid social image: ${url.pathname} (expected complete PNG)`);
    return;
  }
  if (png.width !== 1200 || png.height !== 630) {
    findings.add(`Invalid social image dimensions: ${url.pathname} (expected 1200x630, got ${png.width}x${png.height})`);
  }
}

function valuesForMetadata(metaTags, attribute, key) {
  return metaTags
    .filter((tag) => (tag.get(attribute) ?? "").toLowerCase() === key)
    .map((tag) => tag.get("content") ?? "");
}

function requireSingleMetadata(metaTags, attribute, field, route, findings) {
  const values = valuesForMetadata(metaTags, attribute, field);
  if (values.length === 0) {
    findings.add(`Missing metadata field: ${field} in ${route}`);
  } else if (values.length > 1) {
    findings.add(`Expected exactly one metadata field ${field} in ${route}, found ${values.length}`);
  }
  if (values.length === 1 && !values[0].trim()) {
    findings.add(`Empty metadata field: ${field} in ${route}`);
  }
  return values;
}

function expectedCanonicalUrl(route) {
  const canonicalRoute = route === "/archive/" ? "/projects/" : route;
  return new URL(canonicalRoute, `${site.origin}/`).href;
}

function checkPageUrl(value, label, route, expected, findings) {
  if (!isAbsoluteWebUrl(value)) {
    findings.add(`Non-absolute ${label}: ${value || "(empty)"} in ${route}`);
    return;
  }
  const url = new URL(value);
  const sentenceLabel = label === "canonical URL" ? "Canonical URL" : label;
  if (url.origin !== site.origin) {
    findings.add(`${sentenceLabel} must use ${site.origin} origin: ${value} in ${route}`);
    return;
  }
  if (url.href !== expected) {
    findings.add(`${sentenceLabel} mismatch: expected ${expected}, got ${value} in ${route}`);
  }
}

async function checkMetadata(html, route, outputDir, findings) {
  const documentTags = startTags(html);
  const linkTags = documentTags.filter((tag) => tag.name === "link").map((tag) => tag.attributes);
  const metaTags = documentTags.filter((tag) => tag.name === "meta").map((tag) => tag.attributes);
  const canonicalValues = linkTags
    .filter((tag) => tag.get("rel")?.toLowerCase().split(/\s+/).includes("canonical"))
    .map((tag) => tag.get("href") ?? "");
  const expected = expectedCanonicalUrl(route);

  if (canonicalValues.length === 0) {
    findings.add(`Missing canonical URL: ${route}`);
  } else if (canonicalValues.length > 1) {
    findings.add(`Expected exactly one canonical URL in ${route}, found ${canonicalValues.length}`);
  }
  for (const value of canonicalValues) {
    checkPageUrl(value, "canonical URL", route, expected, findings);
  }

  const metadataValues = new Map();
  for (const field of REQUIRED_PROPERTY_METADATA) {
    metadataValues.set(field, requireSingleMetadata(metaTags, "property", field, route, findings));
  }
  for (const field of REQUIRED_NAMED_METADATA) {
    metadataValues.set(field, requireSingleMetadata(metaTags, "name", field, route, findings));
  }

  const openGraphUrl = metadataValues.get("og:url");
  if (openGraphUrl?.length === 1) {
    checkPageUrl(openGraphUrl[0], "Open Graph URL", route, expected, findings);
  }

  const expectedType = route.startsWith("/essays/") && route.endsWith("/") ? "article" : "website";
  const openGraphType = metadataValues.get("og:type");
  if (openGraphType?.length === 1 && openGraphType[0] !== expectedType) {
    findings.add(`Open Graph type mismatch: expected ${expectedType}, got ${openGraphType[0] || "(empty)"} in ${route}`);
  }

  const twitterCard = metadataValues.get("twitter:card");
  if (twitterCard?.length === 1 && twitterCard[0] !== "summary_large_image") {
    findings.add(`Twitter card mismatch: expected summary_large_image, got ${twitterCard[0] || "(empty)"} in ${route}`);
  }

  const socialValues = metadataValues.get("og:image") ?? [];
  for (const value of socialValues) {
    if (!isAbsoluteWebUrl(value)) {
      findings.add(`Non-absolute Open Graph image URL: ${value || "(empty)"} in ${route}`);
    }
    await checkSocialImage(value, route, outputDir, findings, "Open Graph");
  }
  const twitterImageValues = metadataValues.get("twitter:image") ?? [];
  for (const value of twitterImageValues) {
    if (!isAbsoluteWebUrl(value)) {
      findings.add(`Non-absolute Twitter image URL: ${value || "(empty)"} in ${route}`);
    }
    await checkSocialImage(value, route, outputDir, findings, "Twitter");
  }
  if (socialValues.length === 1 && twitterImageValues.length === 1 && socialValues[0] !== twitterImageValues[0]) {
    findings.add(`Open Graph and Twitter image URLs differ in ${route}`);
  }

  if (route.startsWith("/essays/") && route.endsWith("/") && !metaTags.some(
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
