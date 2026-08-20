const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Wrapper around fetch that:
 *  - prefixes the API base URL
 *  - attaches the JWT (from localStorage) as an Authorization header
 *  - clears the session and bounces to /auth/signin on a 401 response,
 *    since that means the backend rejected the token (missing/expired/invalid)
 *
 * The backend is the real authorization boundary — this only makes sure the
 * frontend always sends the token and reacts sensibly when the backend says no.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/signin";
  }

  return res;
}
