import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const clientSource = readFileSync(new URL("../src/client.js", import.meta.url), "utf8");

function runClient({ reduced }) {
  const items = Array.from({ length: 6 }, () => ({ hidden: false, open: false }));
  const timerDelays = [];
  const clearedTimers = [];
  const media = {
    matches: reduced,
    addEventListener(_type, handler) {
      this.onChange = handler;
    }
  };
  const rotate = {
    addEventListener(_type, handler) {
      this.onClick = handler;
    }
  };
  const window = {
    matchMedia: () => media,
    clearInterval: (timer) => clearedTimers.push(timer),
    setInterval: (_handler, delay) => {
      timerDelays.push(delay);
      return timerDelays.length;
    }
  };
  const document = {
    querySelector(selector) {
      return selector === "[data-rotate-questions]" ? rotate : null;
    },
    querySelectorAll(selector) {
      return selector === "[data-question-item]" ? items : [];
    }
  };

  vm.runInNewContext(clientSource, { document, window });

  return { clearedTimers, items, media, rotate, timerDelays };
}

function visibleIndexes(items) {
  return items.flatMap((item, index) => item.hidden ? [] : [index]);
}

test("reduced motion disables automatic question rotation but preserves manual rotation", () => {
  const app = runClient({ reduced: true });

  assert.deepEqual(app.timerDelays, []);
  assert.deepEqual(visibleIndexes(app.items), [0, 1, 2]);

  app.rotate.onClick();

  assert.deepEqual(visibleIndexes(app.items), [3, 4, 5]);
});

test("question rotation timer follows live motion preference changes", () => {
  const app = runClient({ reduced: false });

  assert.deepEqual(app.timerDelays, [24000]);

  app.media.matches = true;
  app.media.onChange();
  assert.deepEqual(app.timerDelays, [24000]);
  assert.equal(app.clearedTimers.at(-1), 1);

  app.media.matches = false;
  app.media.onChange();
  assert.deepEqual(app.timerDelays, [24000, 24000]);
});
