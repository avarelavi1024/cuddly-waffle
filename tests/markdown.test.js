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
