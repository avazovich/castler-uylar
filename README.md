# Castler — Tayyor uy loyihalari

Public catalog of Castler's ready-made house plans (like 1000proektov.uz):
filterable catalog, a page per house (photos, floor-by-floor room areas,
rough build cost), and a "Loyihani muhokama qilish" form that posts the
lead to the **Castler | Leads** Telegram group. Uzbek (default) and Russian.

Separate project from castler.uz (`~/Desktop/castler-site`), but shares its
Sanity project/dataset so house photos can reuse images already uploaded there.

## Adding and editing houses

Open `/studio` (log in with the same Sanity account as castler.uz):

- **House plans** — one entry per house. Rooms and floors are picked from
  lists, so Russian labels come for free. Untick **Sample data** once a
  house has real numbers, or it keeps its "Namuna" badge.
- **Site settings** — phone, Telegram username, Instagram, address, and the
  "what every house plan includes" list.

Published changes show on the live site within a minute.

## Running locally

```bash
npm run dev -- -p 3333
```

Port 3333 is already allowed in Sanity's CORS settings, so `/studio` works locally.

`.env.local` needs: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
`SANITY_API_TOKEN` (only for the seed script), `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`, and on the host `NEXT_PUBLIC_SITE_URL` (the final domain).

## Sample content

`scripts/seed-sample-houses.mjs` created 10 sample houses (№ 101–110) from
castler.uz's residential projects, plus the Site settings document. Their
sizes, rooms and prices are placeholders. Re-running it never overwrites
edits unless `--force` is passed.
