const API_BASE = "/api";

async function request(path, method, body, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...opts.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

  // For DELETE requests, we might not get a JSON body back on success
  if (res.status === 204 || res.status === 200 && res.headers.get('content-length') === '0') {
    return null; // Or return { success: true } if you prefer
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw data || { message: "Network error" };
  return data;
}

const post = (path, body, opts) => request(path, "POST", body, opts);
const get = (path, opts) => request(path, "GET", undefined, opts);
const put = (path, body, opts) => request(path, "PUT", body, opts);
const del = (path, opts) => request(path, "DELETE", undefined, opts);


export default { post, get, put, del };
