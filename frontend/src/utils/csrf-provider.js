const API_URL = import.meta.env.VITE_API_URL;

let csrfToken = null;
let fetchPromise = null;

const fetchCsrfToken = async () => {
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/csrf-token`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`CSRF token fetch failed: ${response.status}`);
      }

      const data = await response.json();
      csrfToken = data.csrfToken;
      return csrfToken;
    } catch (error) {
      csrfToken = null;
      throw error;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

const refreshToken = async () => {
  csrfToken = null;
  return fetchCsrfToken();
};

const csrfProvider = {
  getToken: () => csrfToken,

  fetchToken: async () => {
    if (csrfToken) return csrfToken;
    return fetchCsrfToken();
  },

  refreshToken,

  clearToken: () => {
    csrfToken = null;
  },
};

export default csrfProvider;
