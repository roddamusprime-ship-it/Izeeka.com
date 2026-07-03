# Izeeka — Wheel Strategy Options Screener

Personal tool for screening cash-secured-put and covered-call
opportunities as part of a wheel strategy. Plug in a ticker, see
strikes across timeframes with premium, delta, theta, IV, annualized
return, and earnings-window warnings.

## Setup

1. Files go here, matching existing repo structure:
   - `lib/options.ts`
   - `app/api/options-chain/route.ts`
   - `app/api/earnings/route.ts`
2. Env var required (already set in Vercel per last check): `POLYGON_API_KEY`
   — this is a Massive.com API key. Massive is the October 2025 rebrand
   of Polygon.io; same account/key, same underlying company.
3. Deploy via normal `git push` to `main` (Vercel auto-deploys from there).

## Endpoints

### `GET /api/options-chain?ticker=NVDA&type=put&deltaMin=0.15&deltaMax=0.30`

Fetches the full options chain from Massive's `/v3/snapshot/options/{ticker}`,
paginates through all results, filters by contract type and delta range,
buckets into timeframes (weekly / biweekly / monthly / quarter / half_year /
leaps), and returns grouped JSON. Cached 15 min.

`type` and delta params are optional — defaults to both contract types,
delta 0.15–0.30.

### `GET /api/earnings?ticker=NVDA`

Fetches next earnings date from Massive's Benzinga partner endpoint.
Cached 1 hour.

**⚠️ UNVERIFIED.** This was written from the endpoint's existence in
Massive's docs index, not from a confirmed live response. Before
trusting this in the UI:

- [ ] Confirm the actual path — is it `/benzinga/v1/earnings` or
      something else? Check https://massive.com/docs/rest/partners/benzinga/earnings
      directly.
- [ ] Confirm query param names (`ticker`? something else? date range
      vs. "next" semantics?)
- [ ] Confirm response field names (`date`? `time`? guessed above)
- [ ] Confirm this is included on the current paid Massive plan —
      partner data (Benzinga) is billed/gated separately from core
      options data per Massive's docs structure. A 401/403 from this
      route means it's not included.

The response includes a `verified: false` field as a reminder until
this is checked and the code updated to match the real API.

`app/api/options-chain/route.ts` calls this internally as a **soft
dependency** — if it fails for any reason, the options chain still
returns, just without `earningsInWindow` flags set to true on any
contract.

## Next.js 16.2.9 note

This repo is on Next.js 16.2.9. The repo's `AGENTS.md` flags this
version as having breaking changes vs. what most LLM training data
assumes for route handlers. These files were written using the
standard `NextRequest`/`NextResponse` App Router pattern, but that
has **not been checked against `node_modules/next/dist/docs/`** in
this session (no local repo access). Verify route handler signatures,
the `revalidate` export, and dynamic-route caching behavior against
the installed version before assuming this compiles/runs as-is.

## What's built

- ✅ `lib/options.ts` — bucketing, annualized return, distance from
  spot, earnings-window flag, delta-range filter, grouping. Pure
  functions, no network calls, should be safe to unit test directly.
- ✅ `app/api/options-chain/route.ts` — chain fetch + pagination +
  filter + bucket. Handles 429 (rate limit) and non-OK responses
  explicitly, unlike the old quote route bug from the original site.
- ⚠️ `app/api/earnings/route.ts` — written but unverified, see above.

## What's NOT built yet

- **Frontend page.** No UI wired to these endpoints yet. The mockup
  shown earlier in chat (ticker input, timeframe tabs, strike table,
  earnings-window banner) still needs to be connected to real
  `/api/options-chain` and `/api/earnings` calls.
- **Watchlist storage.** No decision yet on hardcoded array vs. JSON
  file vs. lightweight KV store, now that Sanity is being removed.
- **Old homepage components.** `TickerTape` (fully static/fake data)
  and the old `/api/quote` route (real fetch but no rate-limit
  handling, no caching, wrong endpoint for "live" data) haven't been
  addressed. Unclear if they're still needed post-pivot — confirm
  whether any old homepage/watchlist UI survives the pivot to the
  wheel-screener tool as the whole site.
- There IS a working live-quote pattern already in the codebase (the
  bottom-right "SPCX" widget, Polygon.io, 60s refresh) — worth using
  as a reference if any live-quote display is still needed on the new
  homepage.

## Immediate next steps

1. Get these files into the repo, commit, push to `main`.
2. Re-test: `izeeka.com/api/options-chain?ticker=NVDA&type=put`
3. Verify the Benzinga earnings endpoint against live docs (see
   checklist above) before trusting `earningsInWindow` flags.
4. Build the frontend table/tabs UI against these two endpoints.
5. Decide watchlist storage approach.
6. Confirm what (if anything) survives from the old homepage.
