import { jwtDecode } from "jwt-decode";

import csrfProvider from "./csrf-provider";
import tokenProvider from "./token-provider";

const authProvider = {
  // authentication
  login: async ({ username, password }) => {
    await csrfProvider.fetchToken();
    const headers = new Headers({ "Content-Type": "application/json" });
    const csrf = csrfProvider.getToken();
    if (csrf) {
      headers.set("X-CSRF-Token", csrf);
    }
    const request = new Request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: username, password }),
      headers,
      credentials: "include",
    });
    return fetch(request)
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          return response.json().then((error) => {
            throw new Error(
              error?.error?.message || error?.message || "Login failed",
            );
          });
        }
        return response.json();
      })
      .then(({ data }) => {
        const { token } = data;
        if (!token) {
          throw new Error("No token received");
        }
        tokenProvider.setToken(token);
      })
      .catch((error) => {
        throw error instanceof Error ? error : new Error("Network error");
      });
  },
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      tokenProvider.removeToken();
      return Promise.reject();
    }
    // other error code (404, 500, etc): no need to log out
    return Promise.resolve();
  },
  checkAuth: () => {
    return tokenProvider.getToken() ? Promise.resolve() : Promise.reject();
  },
  logout: () => {
    tokenProvider.removeToken();
    csrfProvider.clearToken();
    return Promise.resolve();
  },
  getIdentity: () => {
    const token = tokenProvider.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return Promise.resolve({
          id: decodedToken.id || decodedToken._id || decodedToken.sub,
          fullName: decodedToken.fullName || decodedToken.name || "",
          email: decodedToken.email || "",
          role: decodedToken.role,
        });
      } catch (_error) {
        return Promise.reject();
      }
    }
    return Promise.reject();
  },
  // authorization
  getPermissions: () => {
    const token = tokenProvider.getToken();
    if (token) {
      const decodedToken = jwtDecode(token);
      const role = decodedToken.role;
      return role ? Promise.resolve(role) : Promise.reject();
    }
    return Promise.reject();
  },
};

export default authProvider;
