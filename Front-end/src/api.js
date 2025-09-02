const API_BASE = "/api";

async function post(path, body, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    ...opts,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw data || { message: "Network error" };
  return data;
}

// Added a 'get' method for making GET requests to the backend
async function get(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    credentials: "include",
    ...opts,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw data || { message: "Network error" };
  return data;
}

export default { post, get };
