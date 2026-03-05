import DOMPurify from "dompurify";

export function sanitize(value: string): string {
  if (typeof window === "undefined") return value;
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const val = obj[key];
    result[key] = typeof val === "string" ? sanitize(val) : val;
  }
  return result as T;
}