# BiblePlus Admin — QA & UAT Regression Collection

Covers every backend fix from **PR #1** (QA sheet) and **PR #2** (UAT sheet).

| | |
|---|---|
| Folders | 13 |
| Requests | 103 |
| Assertions | 281 |

## Setup

1. Import both files into Postman:
   - `BiblePlus-Admin-QA-UAT.postman_collection.json`
   - `BiblePlus-Admin-Local.postman_environment.json`
2. Select the environment and fill in `baseUrl`, `adminEmail`, `adminPassword`.
3. Run **`00 · Setup → Admin login`** first — it captures `adminToken`, which every
   other request uses via collection-level bearer auth.
4. Then run the whole collection in order (Collection Runner). Folders create and
   clean up their own data.

## Reading the results

Requests named **REGRESSION** pin a specific bug. If one fails, that bug is back:

| Request | Guards against |
|---|---|
| `Admin list — was 404` | `/api/admin/events` had no GET routes |
| `search with NO term — was a 500` | `$regex: undefined` reaching Mongo |
| `regex metacharacters — was a 500` | unescaped search input |
| `edit echoing _id/slug/views back` | Mongo refusing immutable-path updates |
| `picture under field 'cover' — was a 500` | multer `LIMIT_UNEXPECTED_FILE` |
| `missing options — was a bare 500` | crash on `.length` before validation |
| `DELETE — the endpoint that did not exist` | Quiz delete had no route |
| `send to ONE user — silently created nothing` | `userId` passed as the `target` arg |
| `resend — was a guaranteed 500` | push helpers throwing when unconfigured |
| `Deleted user drops out of the list AND the count` | `countDocuments` bypassing the soft-delete filter |

The single most important assertion is in `05 · Analytics`:
**`CROSS-CHECK: overview total === users list total`** — that is the QA
"Numbers of Users" complaint, asserted directly.

## Requests needing a file attachment

Three requests in `03 · Books` upload an image. Postman cannot carry binaries in a
shared collection, so **attach any small image** to the file field before running
them, or skip them. They are the ones that prove the cover-upload fix.

## Running headless

```bash
npm i -g newman
newman run postman/BiblePlus-Admin-QA-UAT.postman_collection.json \
  -e postman/BiblePlus-Admin-Local.postman_environment.json \
  --env-var adminPassword="$ADMIN_PASSWORD"
```

## Caveats

- The three file-upload requests are skipped unless you attach an image.
- `08 · Notifications` asserts `pushDelivered` is a *boolean*, not that it is
  `true`. Push is currently undeliverable in this deployment: `FIREBASE_SERVICE_ACCOUNT`
  is truncated in `.env` and OneSignal is unconfigured. The point of the test is
  that resend returns 200 and reports honestly rather than 500ing.
- `04 · Users` deactivates, soft-deletes and restores a **real user** — the first
  row of the list. Point `baseUrl` at staging, not production.
