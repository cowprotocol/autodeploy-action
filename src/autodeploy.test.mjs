import assert from "node:assert";
import test from "node:test";

import { parseToken, AutoDeployApi } from "./autodeploy.mjs";

test("parses username and password", () => {
  const token = parseToken("u:p:");
  assert.strictEqual(token.username, "u");
  assert.strictEqual(token.password, "p:");
});

test("parses authorization token", () => {
  const token = parseToken("abc");
  assert.strictEqual(token.token, "abc");
});

test("computes correct redeploy URL", () => {
  const api = new AutoDeployApi("https://foo.bar/", "u:p");
  assert.strictEqual(
    api.redeployUrl("services", "foo, bar baz"),
    "https://foo.bar/services/foo,bar%20baz/rollout",
  );
});

test("properly escapes image names", () => {
  const api = new AutoDeployApi("https://foo.bar/", "u:p");
  assert.strictEqual(
    api.redeployUrl("image", "foo/bar/baz:baw"),
    "https://foo.bar/image/foo%2Fbar%2Fbaz%3Abaw/rollout",
  );
});

function dummyApi(statusCode) {
  const api = new AutoDeployApi("dummy", "dummy");
  api.client.postJson = () => ({ statusCode });
  return api;
}

test("returns successfully on 2xx status codes", async () => {
  const api = dummyApi(200);
  const status = await api.redeploy("foo", "bar");
  assert.strictEqual(status, 200);
});

test("throws on error codes", async () => {
  const api = dummyApi(404);
  await assert.rejects(() => api.redeploy("foo", "bar"), {
    message: "HTTP error 404",
  });
});
