import { HttpError } from "react-admin";

export const createHeadersFromOptions = (options) => {
  const requestHeaders = options.headers || {
    Accept: "application/json",
  };

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

  return requestHeaders;
};

export const fetchJson = (url, options = {}) => {
  const requestHeaders = createHeadersFromOptions(options);
  return fetch(url, { ...options, headers: requestHeaders })
    .then((response) =>
      response.text().then((text) => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text,
      })),
    )
    .then(({ status, statusText, headers, body }) => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (_e) {
        // Not JSON, no big deal - will use statusText as error message
      }
      if (status < 200 || status >= 300) {
        return Promise.reject(
          new HttpError(
            (json && json?.error?.message) || statusText,
            status,
            json,
          ),
        );
      }
      return Promise.resolve({ status, headers, body, json });
    });
};
