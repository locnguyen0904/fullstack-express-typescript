import { HttpError } from "react-admin";

import csrfProvider from "./csrf-provider";

export const createHeadersFromOptions = (options) => {
  const requestHeaders =
    options.headers ||
    new Headers({
      Accept: "application/json",
    });

  if (
    !requestHeaders.has("Content-Type") &&
    !(options && (!options.method || options.method === "GET")) &&
    !(options && options.body && options.body instanceof FormData)
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (options.user && options.user.authenticated && options.user.token) {
    requestHeaders.set("Authorization", options.user.token);
  }

  const csrfToken = csrfProvider.getToken();
  if (csrfToken && options.method && options.method !== "GET") {
    requestHeaders.set("X-CSRF-Token", csrfToken);
  }

  return requestHeaders;
};

const doFetch = async (url, options) => {
  const requestHeaders = createHeadersFromOptions(options);
  const response = await fetch(url, {
    ...options,
    headers: requestHeaders,
    credentials: "include",
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (_e) {
    // Not JSON
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    body: text,
    json,
  };
};

export const fetchJson = async (url, options = {}) => {
  try {
    if (!csrfProvider.getToken()) {
      await csrfProvider.fetchToken();
    }
  } catch {
    if (options.method && options.method !== "GET") {
      throw new HttpError("Failed to initialize CSRF protection", 403);
    }
  }

  let result = await doFetch(url, options);

  if (
    result.status === 403 &&
    result.json?.error?.message?.toLowerCase().includes("csrf")
  ) {
    try {
      await csrfProvider.refreshToken();
      result = await doFetch(url, options);
    } catch (_retryError) {
      // Use original error
    }
  }

  if (result.status < 200 || result.status >= 300) {
    throw new HttpError(
      (result.json && result.json?.error?.message) || result.statusText,
      result.status,
      result.json,
    );
  }

  return {
    status: result.status,
    headers: result.headers,
    body: result.body,
    json: result.json,
  };
};
