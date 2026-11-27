// Run with: node --test tests/ (Node 22 strips the TypeScript types itself).
import assert from "node:assert/strict";
import { test } from "node:test";

import { helpLayout, parseHours, waitingNotice } from "../src/helpLogic.ts";

test("danger path shows the emergency number first, for every audience", () => {
  assert.equal(helpLayout("danger", "adult").emergencyFirst, true);
  assert.equal(helpLayout("danger", "teen").emergencyFirst, true);
  assert.equal(helpLayout("control", "adult").emergencyFirst, false);
});

test("teen covers never offer the adult counselor chat", () => {
  for (const path of ["control", "danger", "grooming", "all"]) {
    const layout = helpLayout(path, "teen");
    assert.equal(layout.chat, false);
    assert.equal(layout.childHelpline, true);
  }
  assert.equal(helpLayout("grooming", "adult").chat, true);
  assert.equal(helpLayout("grooming", "adult").childHelpline, false);
});

test("while she waits with no counselor online, the chat says so", () => {
  assert.equal(waitingNotice("waiting", false), "noCounselor");
  assert.equal(waitingNotice("waiting", true), "replySoon");
});

test("no notice before the server answers, during a conversation or after it", () => {
  assert.equal(waitingNotice("waiting", undefined), "none");
  assert.equal(waitingNotice("active", false), "none");
  assert.equal(waitingNotice("active", true), "none");
  assert.equal(waitingNotice("closed", false), "none");
});

test("reply hours are parsed or ignored, never guessed", () => {
  assert.deepEqual(parseHours("09:00-21:00"), ["09:00", "21:00"]);
  assert.deepEqual(parseHours(" 8:30 - 16:00 "), ["8:30", "16:00"]);
  assert.equal(parseHours("weekdays"), null);
  assert.equal(parseHours(undefined), null);
});
