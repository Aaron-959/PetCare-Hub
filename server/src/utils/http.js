export function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

export function isObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || ""));
}

export function cleanText(value, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
