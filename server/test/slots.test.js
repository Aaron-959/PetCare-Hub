import test from "node:test";
import assert from "node:assert/strict";
import { addMinutes, isDateKey } from "../src/utils/slots.js";

test("accepts valid calendar date keys and rejects malformed dates", () => {
  assert.equal(isDateKey("2026-10-28"), true);
  assert.equal(isDateKey("2026-02-30"), false);
  assert.equal(isDateKey("28-10-2026"), false);
});

test("calculates appointment end times, including crossing an hour boundary", () => {
  assert.equal(addMinutes("09:30", 30), "10:00");
  assert.equal(addMinutes("16:45", 30), "17:15");
});
