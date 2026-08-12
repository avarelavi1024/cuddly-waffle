import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const artworks = [
  ["editorial-politics.svg", "01", "POWER / MEMORY", "category-symbol category-symbol-politics"],
  ["editorial-myths.svg", "02", "SYMBOL / RETELLING", "category-symbol category-symbol-mythologies"],
  ["editorial-cities.svg", "03", "SPACE / BELONGING", "category-symbol category-symbol-cities"],
  ["editorial-visual-culture.svg", "04", "IMAGE / MEDIATION", "category-symbol category-symbol-visual-culture"],
  ["editorial-nutrition.svg", "05", "BODY / BALANCE", "category-symbol category-symbol-health"],
  ["editorial-business.svg", "06", "WORK / SYSTEMS", "category-symbol category-symbol-business"],
  ["editorial-open-questions.svg", "07", "IDEAS / IN PROGRESS", "category-symbol category-symbol-open-questions"]
];

test("category SVGs share the approved archive grammar and unique symbolic hooks", async () => {
  for (const [file, number, label, symbolClass] of artworks) {
    const svg = await readFile(`src/images/${file}`, "utf8");
    assert.match(svg, /viewBox="0 0 1200 900"/);
    assert.match(svg, /class="category-field"/);
    assert.match(svg, /class="category-rule"/);
    assert.match(svg, new RegExp(`>${number}<`));
    assert.match(svg, new RegExp(`>${label}<`));
    assert.match(svg, new RegExp(`class="${symbolClass}"`));
    assert.ok((svg.match(/#[0-9a-fA-F]{6}/g) || []).length <= 12);
  }
});

test("category cards use the light editorial treatment and restrained interaction", async () => {
  const css = await readFile("src/styles.css", "utf8");
  assert.match(css, /\.category-tile\s*\{[^}]*background:\s*var\(--paper\)[^}]*border-top:\s*1px solid var\(--ink\)/s);
  assert.match(css, /\.category-tile img\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3[^}]*object-fit:\s*cover/s);
  assert.match(css, /\.category-tile span\s*\{[^}]*position:\s*relative[^}]*color:\s*var\(--ink\)/s);
  assert.doesNotMatch(css, /\.category-tile:hover img[^{]*\{[^}]*rotate\(/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.category-tile img\s*\{[^}]*transition:\s*none/s);
});

test("category page artwork preserves its editorial ratio responsively", async () => {
  const css = await readFile("src/styles.css", "utf8");
  assert.match(css, /\.category-title img\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3[^}]*object-fit:\s*cover/s);
  assert.match(css, /@media \(max-width:\s*820px\)[\s\S]*?\.category-title[^}]*grid-template-columns:\s*1fr/s);
});
