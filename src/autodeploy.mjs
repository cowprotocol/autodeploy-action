import { HttpClient } from "@actions/http-client";
import {
  BasicCredentialHandler,
  PersonalAccessTokenCredentialHandler,
} from "@actions/http-client/lib/auth.js";

export function parseToken(token) {
  const separator = token.indexOf(":");
  if (separator >= 0) {
    const user = token.substring(0, separator);
    const password = token.substring(separator + 1);
    return new BasicCredentialHandler(user, password);
  }
  return new PersonalAccessTokenCredentialHandler(token);
}

export class AutoDeployApi {
  constructor(url, token, timeout) {
    this.url = url.replace(/\/*$/, "");
    this.client = new HttpClient("autodeploy-action", [parseToken(token)], {
      socketTimeout: timeout,
    });
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

export class HttpError extends Error {
  constructor(status) {
    super(`HTTP error ${status}`);
    this.status = status;
  }
}
