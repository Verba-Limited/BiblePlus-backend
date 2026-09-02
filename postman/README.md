# BiblePlus API — Full Postman Collection

| | |
|---|---|
| Folders | 25 |
| Requests | 260 |
| Assertions | 584 |
| Endpoint coverage | **217 / 217 reachable routes (100%)** |

**Folders 00-12** — QA/UAT regression suite. Covers every backend fix from PR #1
(QA sheet) and PR #2 (UAT sheet), with assertions that pin each specific bug.

**Folders 13-24** — the rest of the API: auth, profile, bible, reader features,
prayer, quiz gameplay, chatbot, and the remaining admin screens. These carry smoke
assertions (route exists, no 5xx) rather than deep behavioural ones.

Every route the app actually mounts has at least one request, and every request maps
to a real route — verified by an audit that derives the mount table from `app.ts` and
`admin.index.routes.ts` directly, rather than from a hand-kept list.

### Route files that are NOT mounted

Five routers exist in the codebase but are never mounted, so their endpoints are
unreachable and cannot be tested:

| File | Status |
|---|---|
| `modules/xp/userXp.routes.ts` | unreachable — imported by nothing |
| `modules/quiz/quizPuzzle.routes.ts` | unreachable — imported by nothing |
| `modules/blog/blogLike.routes.ts` | unreachable — imported by nothing |
| `modules/blog/blogComments.routes.ts` | unreachable — imported by nothing |
| `modules/blog/blogCategory.routes.ts` | unreachable (the *admin* category router is mounted) |

`books/bookFavorite.routes.ts` and `books/bookProgress.routes.ts` are also unmounted,
but their endpoints are reachable because `book.routes.ts` declares the same paths
itself — those two files are dead duplicates.

## Two identities

| Variable | Captured by |
|---|---|
| `adminToken` | `00 · Setup → Admin login` |
| `userToken` | `13 · Auth → Login` |

Run `00 · Setup` and `13 · Auth` first, or just run the whole collection in order.

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

Several requests upload an image (books covers, blog editor images, avatars, event
banners and galleries — their descriptions say ATTACH AN IMAGE). Postman cannot carry binaries in a
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

- File-upload requests fail until you attach an image.
- **OTP is email-only in every environment — there is no bypass code.** Three
  requests are therefore MANUAL: `13 · Auth → Verify OTP`, `13 · Auth → Reset
  password`, and `24 · Admin → Settings: change password`. Read the code from the
  inbox into the `emailOtp` (or `adminOtp`) variable, then send. Codes expire after
  5 minutes; admin codes after 10. `13 · Auth → Resend verification OTP` issues a
  fresh one.
- `14 · Profile → Delete my account` is destructive — skip unless intended.
- `08 · Notifications` asserts `pushDelivered` is a *boolean*, not that it is
  `true`. Push is currently undeliverable in this deployment: `FIREBASE_SERVICE_ACCOUNT`
  is truncated in `.env` and OneSignal is unconfigured. The point of the test is
  that resend returns 200 and reports honestly rather than 500ing.
- `04 · Users` deactivates, soft-deletes and restores a **real user** — the first
  row of the list. Point `baseUrl` at staging, not production.
