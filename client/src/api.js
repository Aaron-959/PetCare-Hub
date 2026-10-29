const API_BASE = import.meta.env.VITE_API_URL || "";

export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/v1${path}`, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers }
    });
  } catch {
    throw new Error("Could not reach PetCare Hub. Check that the backend is running and try again.");
  }
  if (!response.headers.get("content-type")?.includes("application/json")) {
    if (!response.ok) {
      throw new Error("PetCare Hub could not reach its API. Check that the backend is running and MongoDB is configured.");
    }
    throw new Error("PetCare Hub received an unexpected response from its API.");
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("PetCare Hub received an invalid response from its API. Please retry.");
  }
  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const send = (method, body) => ({ method, body: JSON.stringify(body) });
