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
