# Castler — Tayyor uy loyihalari

Public catalog of Castler's ready-made house plans (like 1000proektov.uz):
filterable catalog, a page per house (photos, floor-by-floor room areas,
rough build cost), and a "Loyihani muhokama qilish" form that posts the
lead to the **Castler | Leads** Telegram group. Uzbek (default) and Russian.

Separate project from castler.uz (`~/Desktop/castler-site`), but shares its
Sanity project/dataset so house photos can reuse images already uploaded there.

## Adding and editing houses

**Admin page — `/admin`** (Uzbek, one shared password): list of houses, add /
edit / delete a house (details, prices, sizes, photos, floor plans with rooms,
build-cost table) and the site settings (phone, Telegram, Instagram, address,
"what's included"). Photos are shrunk in the browser to ≤2560px before upload;
click a photo to mark the house's centre and the site crops around it.
Saving refreshes the public pages straight away.

- Password: `ADMIN_PASSWORD` in `.env.local`. Changing it signs everyone out
  (it is part of the key that signs the 14-day session cookie,
  `ADMIN_SESSION_SECRET`).
- Every admin page, server action (`app/admin/actions.ts`) and the upload
  route checks the session itself (`lib/admin/session.ts`).
- Untick **Namuna** once a house has real numbers, or it keeps its badge.

`/studio` (Sanity Studio, English, needs a Sanity account) edits the same
data and stays available as a backup.

## Running locally

```bash
npm run dev -- -p 3333
```

Port 3333 is already allowed in Sanity's CORS settings, so `/studio` works locally.

`.env.local` needs: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
`SANITY_API_TOKEN` (write access — used by /admin and the seed script),
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ADMIN_PASSWORD`,
`ADMIN_SESSION_SECRET`, and on the host `NEXT_PUBLIC_SITE_URL` (the final
domain). Use a new, strong `ADMIN_PASSWORD` on the live site.

## Sample content

`scripts/seed-sample-houses.mjs` created 10 sample houses (№ 101–110) from
castler.uz's residential projects, plus the Site settings document. Their
sizes, rooms and prices are placeholders. Re-running it never overwrites
edits unless `--force` is passed.
