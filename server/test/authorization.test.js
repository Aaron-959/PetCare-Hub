import test from "node:test";
import assert from "node:assert/strict";
import { requireAdmin } from "../src/middleware/auth.js";

test("administrator middleware rejects owners without continuing", () => {
  let continued = false;
  const response = {
    statusCode: 0,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  requireAdmin({ user: { role: "owner" } }, response, () => { continued = true; });
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.message, "Administrator access is required.");
  assert.equal(continued, false);
});

test("administrator middleware permits administrators", () => {
  let continued = false;
  requireAdmin({ user: { role: "admin" } }, { status() { throw new Error("Should not reject an administrator."); } }, () => { continued = true; });
  assert.equal(continued, true);
});
