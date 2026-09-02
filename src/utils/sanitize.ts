/* =====================================================
   PAYLOAD SANITIZERS

   Admin editors (blog / event / book) typically load a
   record, let the user correct a few fields and PUT the
   whole object back — `_id`, `slug`, `createdAt` and all.
   Mongo rejects updates that touch immutable paths, so
   the edit blows up even though nothing invalid changed.

   These helpers drop the fields an editor must never be
   able to rewrite before the payload reaches Mongoose.
===================================================== */

/** Fields no client may ever set, on any collection. */
const ALWAYS_IMMUTABLE = [
  "_id",
  "id",
  "__v",
  "createdAt",
  "updatedAt"
];

/**
 * Remove immutable + server-owned fields from an update payload.
 * Also drops `undefined` values so a partial edit never blanks a field.
 */
export const sanitizeUpdate = <T extends Record<string, any>>(
  data: T,
  extraProtected: string[] = []
): Record<string, any> => {
  const blocked = new Set([...ALWAYS_IMMUTABLE, ...extraProtected]);
  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(data || {})) {
    if (blocked.has(key)) continue;
    if (value === undefined) continue;
    clean[key] = value;
  }

  return clean;
};

/**
 * Escape user input before dropping it into a `$regex` query so
 * characters like `(`, `*` or `+` search literally instead of
 * throwing an "Invalid regular expression" error.
 */
export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Multipart form bodies arrive as strings — "3", "true", "".
 * Convert the fields a schema expects as numbers/booleans.
 */
export const coerceTypes = (
  data: Record<string, any>,
  { numbers = [], booleans = [] }: { numbers?: string[]; booleans?: string[] }
): Record<string, any> => {
  const out = { ...data };

  for (const key of numbers) {
    if (out[key] === undefined || out[key] === "") continue;
    const parsed = Number(out[key]);
    if (!Number.isNaN(parsed)) out[key] = parsed;
  }

  for (const key of booleans) {
    if (out[key] === undefined || out[key] === "") continue;
    out[key] = out[key] === true || out[key] === "true";
  }

  return out;
};

/**
 * Pull a search term out of a query string, whatever the client
 * decided to call it. Returns "" when nothing usable was sent —
 * callers must not hand `undefined` to `$regex`.
 */
export const readSearchTerm = (query: Record<string, any>): string => {
  const raw = query?.q ?? query?.search ?? query?.query ?? query?.term ?? "";
  return typeof raw === "string" ? raw.trim() : "";
};
