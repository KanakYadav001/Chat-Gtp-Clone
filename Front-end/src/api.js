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

export default { post };
