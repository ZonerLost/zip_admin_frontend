export function cn(...parts) {
  return parts
    .flatMap((p) => (Array.isArray(p) ? p : [p]))
    .filter(Boolean)
    .join(" ");
}
