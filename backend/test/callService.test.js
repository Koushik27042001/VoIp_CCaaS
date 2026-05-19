import test from "node:test";
import assert from "node:assert/strict";
import { calculateCallDuration, formatDuration } from "../src/services/callService.js";

test("calculateCallDuration returns whole seconds and never negative values", () => {
  assert.equal(
    calculateCallDuration(new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-01T00:00:08.900Z")),
    8
  );
  assert.equal(
    calculateCallDuration(new Date("2026-01-01T00:00:08.000Z"), new Date("2026-01-01T00:00:00.000Z")),
    0
  );
});

test("formatDuration keeps agent-facing call duration readable", () => {
  assert.equal(formatDuration(0), "0:00");
  assert.equal(formatDuration(9), "0:09");
  assert.equal(formatDuration(125), "2:05");
});
