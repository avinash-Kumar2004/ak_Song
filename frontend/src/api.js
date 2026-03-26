const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("sw_token");

  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return { data };
}

// ── Auth API ──────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (body) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  login: (body) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  getMe: () => request("/auth/me"),

  logout: () => request("/auth/logout", { method: "POST" }),
};

// ── User API ──────────────────────────────────────────────────────────────
export const userAPI = {
  updateProfile: (body) =>
    request("/users/profile", { method: "PATCH", body: JSON.stringify(body) }),

  changePassword: (body) =>
    request("/users/change-password", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  uploadAvatar: (formData) =>
    request("/users/upload-avatar", { method: "POST", body: formData }),
};