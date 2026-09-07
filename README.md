# Family Vacation Site (June 2027)

Shareable family voting app for a 14-person June 2027 trip (kids 11/8/4/2). Book lodging by 2026-09-30.

Stack: Next.js App Router + TypeScript + Tailwind + Leaflet/OSM + Prisma + SQLite.
Clear path to Postgres/Supabase for production.

## Features

- Interactive US map (destinations + lodgings)
- Claude rubric; lodging feasibility under 10 = DISQUALIFIED
- Per-origin travel difficulty (five households)
- Attraction age-band ratings
- URL paste with OG extract fallback to manual fields
- Finalize exactly 2 lodgings for ballot
- Borda ranked lodging votes
- Destinations with 0 qualifying lodging are gated
- Public views never show submitter names
- Passwordless email + household cookie auth (demo)

## Quick start

1. npm install
2. Copy .env.example to .env
3. npx prisma db push
4. npm run db:seed
5. npm run dev

Open http://localhost:3000
Sign in with any email. Admin default: joe@example.com

## Scoring (100 pts)

1 Lodging feasibility GATE 25
2 On-site kid amenities 10
3 Travel burden 20 (SEA 10 + others 10)
4 Kid activities 2-11: 15
5 Nature/NP 15
6 Overflow 5
7 June cost/conditions 10

Claude top 6: Gatlinburg/PF 89, Estes/YMCA 85, Park City/Heber 84, Orlando Reunion/CG 83, Branson 73, Blue Ridge GQ 71.
Research: Hilton Head, Destin/30A, WI Dells, OBX, Zon, San Diego, Yellowstone.

## Env

DATABASE_URL (default file:../data/dev.db)
SESSION_SECRET
ADMIN_EMAIL
NEXT_PUBLIC_APP_NAME

## Production

Change Prisma provider to postgresql, point DATABASE_URL at Supabase, migrate + seed.
Deploy on Vercel free tier. Prefer Postgres over SQLite on serverless.

## Pages

/ - map
/destinations/[slug] - scores + lodgings + attractions
/lodgings/[id] - lodging detail
/submit - add lodging
/me - finalize 2
/vote - Borda ballot
/admin - dates + pending queue

## Hard lodging rules

At least 7 real bedrooms, sleeps 14+, prefer pool/game/theater, 6+ baths, 3+ parking.
