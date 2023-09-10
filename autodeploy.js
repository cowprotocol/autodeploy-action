const { HttpClient } = require("@actions/http-client");
const { BasicCredentialHandler, PersonalAccessTokenCredentialHandler } =
  require("@actions/http-client/auth");

function parseToken(token) {
  const separator = token.indexOf(":");
  if (separator >= 0) {
    const user = token.substring(0, separator);
    const password = token.substring(separator + 1);
    return new BasicCredentialHandler(user, password);
  } else {
    return new PersonalAccessTokenCredentialHandler(token);
  }
}

class AutoDeployApi {
  constructor(url, token) {
    this.url = url.replace(/\/*$/, "");
    this.client = new HttpClient("autodeploy-action", [parseToken(token)]);
  }

  redeployUrl(type, targets) {
    const encodedTargets = targets
      .split(",")
      .map((target) => encodeURIComponent(target.trim()))
      .join(",");
    return `${this.url}/${type}/${encodedTargets}/rollout`;
  }

  async redeploy(type, targets, tag) {
    const response = await this.client.postJson(
      this.redeployUrl(type, targets),
      { push_data: { tag } },
    );

    const status = response.statusCode;
    if (status >= 400) {
      throw new HttpError(status);
    }

    return status;
  }
}

class HttpError extends Error {
  constructor(status) {
    super(`HTTP error ${status}`);
    this.status = status;
  }
}

module.exports = { parseToken, AutoDeployApi, HttpError };
