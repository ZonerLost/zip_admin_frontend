const DEFAULT_TIMEOUT_MS = 20000;

function buildUrl(path) {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  if (!base) return path;
  if (path.startsWith("http")) return path;
  return `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
}

async function withTimeout(promise, timeoutMs) {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("zip_refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  const base = import.meta.env.VITE_API_BASE_URL || "";
  const url = `${base.replace(/\/$/, "")}/auth/refresh-token`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error("Token refresh failed");

  const data = await res.json();
  const newToken = data?.data?.accessToken;
  if (!newToken) throw new Error("No access token in refresh response");

  localStorage.setItem("zip_admin_token", newToken);
  return newToken;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const token = localStorage.getItem("zip_admin_token");

  const doFetch = (accessToken) =>
    withTimeout(
      fetch(buildUrl(path), {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...headers,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      }),
      timeoutMs
    );

  let res = await doFetch(token);

  // Auto-refresh on 401
  if (res.status === 401) {
    if (isRefreshing) {
      // Wait for the ongoing refresh to complete
      const newToken = await new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
      res = await doFetch(newToken);
    } else {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        res = await doFetch(newToken);
      } catch (err) {
        processQueue(err, null);
        // Refresh failed — clear session and redirect to login
        localStorage.removeItem("zip_admin_token");
        localStorage.removeItem("zip_refresh_token");
        localStorage.removeItem("zip_admin_user");
        window.location.href = "/login";
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    apiRequest(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    apiRequest(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    apiRequest(path, { ...options, method: "PATCH", body }),
  del: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};