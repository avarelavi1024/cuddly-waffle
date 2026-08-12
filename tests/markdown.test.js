import { test } from "node:test";
import assert from "node:assert/strict";
import { markdownToHtml } from "../src/markdown.js";

test("markdownToHtml converts headings, paragraphs, emphasis, and links", () => {
  const html = markdownToHtml(`# Title

This is **strong** and *emphasized* with [a link](https://example.com).`);

  assert.equal(
    html,
    `<h1>Title</h1>
<p>This is <strong>strong</strong> and <em>emphasized</em> with <a href="https://example.com">a link</a>.</p>`
  );
});

test("markdownToHtml escapes raw HTML", () => {
  assert.equal(markdownToHtml(`<script>alert("x")</script>`), `<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>`);
});

test("markdownToHtml converts section reference headings", () => {
  assert.equal(markdownToHtml(`### References for this section`), `<h3>References for this section</h3>`);
});

test("markdownToHtml preserves headings with leading indentation", () => {
  assert.equal(
    markdownToHtml(`# First heading\n\n  ## Indented heading`),
    `<h1>First heading</h1>
<h2>Indented heading</h2>`
  );
});

test("markdownToHtml renders editorial block elements", () => {
  const html = markdownToHtml(`> A quoted claim.\n\n- First source\n- Second source\n\n1. First step\n2. Second step\n\n---`);
  assert.equal(html, `<blockquote><p>A quoted claim.</p></blockquote>
<ul>
<li>First source</li>
<li>Second source</li>
</ul>
<ol>
<li>First step</li>
<li>Second step</li>
</ol>
<hr>`);
});

test("markdownToHtml escapes HTML inside lists and block quotes", () => {
  const html = markdownToHtml(`- <img src=x onerror=alert(1)>\n\n> <script>alert(1)</script>`);
  assert.doesNotMatch(html, /<img|<script>/);
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;script/);
});

test("markdownToHtml renders a credited local image as a semantic figure", () => {
  const html = markdownToHtml(`![A green silk dress](images/green-dress.jpg "Dress, ca. 1860 · The Metropolitan Museum of Art · Public domain")`);

  assert.equal(
    html,
    `<figure class="editorial-figure"><img src="/images/green-dress.jpg" alt="A green silk dress" loading="lazy"><figcaption>Dress, ca. 1860 · The Metropolitan Museum of Art · Public domain</figcaption></figure>`
  );
});

test("markdownToHtml does not turn remote or unsafe image paths into figures", () => {
  const html = markdownToHtml(`![Remote](https://example.com/image.jpg "Remote")\n\n![Unsafe](../secret.jpg "Unsafe")`);

  assert.doesNotMatch(html, /<img/);
});
