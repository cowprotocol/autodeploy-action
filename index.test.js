const { parseToken, AutoDeployApi } = require("./autodeploy");

test("parses username and password", () => {
  const token = parseToken("u:p:");
  expect(token.username).toBe("u");
  expect(token.password).toBe("p:");
});

test("parses authorization token", () => {
  const token = parseToken("abc");
  expect(token.token).toBe("abc");
});

test("computes correct redeploy URL", () => {
  const api = new AutoDeployApi("https://foo.bar/", "u:p");
  expect(api.redeployUrl("services", "rollout", "foo, bar baz")).toBe(
    "https://foo.bar/services/foo,bar%20baz/rollout",
  );
});

test("properly escapes image names", () => {
  const api = new AutoDeployApi("https://foo.bar/", "u:p");
  expect(api.redeployUrl("image", "rollout", "foo/bar/baz:baw")).toBe(
    "https://foo.bar/image/foo%2Fbar%2Fbaz%3Abaw/rollout",
  );
});

function dummyApi(url) {
  const api = new AutoDeployApi("dummy", "dummy");
  api.redeployUrl = () => url;
  return api;
}

test("returns successfully on 2xx status codes", async () => {
  const api = dummyApi("https://httpbingo.org/post");
  const status = await api.redeploy("foo", "rollout", "bar");
  expect(status).toBe(200);
});

test("throws on error codes", async () => {
  const api = dummyApi("https://httpbingo.org/status/404");
  await expect(api.redeploy("foo", "rollout", "bar")).rejects.toThrow(
    "HTTP error 404",
  );
});
