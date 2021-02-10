
const dateFormat = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
export function dateReviver(key, value) {
  if (typeof value === "string" && dateFormat.test(value)) {
    return new Date(value);
  }

  return value;
}
