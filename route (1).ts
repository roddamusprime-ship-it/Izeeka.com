// app/api/earnings/route.ts
//
// GET /api/earnings?ticker=NVDA
//
// Fetches the next earnings date for a ticker from Massive's Benzinga
// partner endpoint.
//
// *** UNVERIFIED — see README.md ***
// The exact path, query param names, and response shape below are
// best-effort based on Massive's general partner-endpoint pattern
// (docs at massive.com/docs/rest/partners/benzinga/earnings) and have
// NOT been confirmed against a live response. Also unconfirmed: this
// endpoint is billed/gated separately from core options data, so it's
// unclear whether it's included on the current paid plan at all. Do
// not treat this file as working until both of those are checked —
// this is why app/api/options-chain/route.ts treats earnings as a
// best-effort soft dependency rather than a hard requirement.

import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600; // 1 hour

const MASSIVE_BASE_URL = "https://api.polygon.io"; // same host assumption as options-chain route — confirm Benzinga partner data is served from here vs. a separate domain

interface BenzingaEarningsResult {
  ticker?: string;
  date?: string; // guessed field name — unverified
  time?: string; // e.g. "before market open" / "after market close" — guessed, unverified
  fiscal_period?: string;
  eps_estimate?: number | null;
}

interface BenzingaEarningsResponse {
  results?: BenzingaEarningsResult[];
  status?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "Missing required query param: ticker" }, { status: 400 });
  }

  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: POLYGON_API_KEY not set" },
      { status: 500 }
    );
  }

  // Guessed endpoint shape — verify against massive.com/docs/rest/partners/benzinga/earnings
  // before relying on this. Likely candidates to check: does it take
  // a date range instead of returning "next" directly? Is "ticker" the
  // right param name? Is there a separate API key for partner data?
  const url = `${MASSIVE_BASE_URL}/benzinga/v1/earnings?ticker=${encodeURIComponent(
    ticker
  )}&limit=1&sort=date.asc&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (res.status === 404) {
      // Treat "endpoint doesn't exist at this path" and "no upcoming
      // earnings found" the same way at the API boundary — caller
      // just gets no date either way.
      return NextResponse.json({ ticker, nextEarningsDate: null, verified: false });
    }
    if (res.status === 403 || res.status === 401) {
      return NextResponse.json(
        {
          error:
            "Not authorized for Benzinga earnings data — this may not be included on the current Massive plan",
          verified: false,
        },
        { status: 403 }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: `Massive earnings API returned ${res.status}`, verified: false },
        { status: 502 }
      );
    }

    const data: BenzingaEarningsResponse = await res.json();
    if (data.error) {
      return NextResponse.json({ error: data.error, verified: false }, { status: 502 });
    }

    const next = data.results?.[0] ?? null;

    return NextResponse.json({
      ticker,
      nextEarningsDate: next?.date ?? null,
      timing: next?.time ?? null,
      verified: false, // flip to true once this endpoint's shape has been confirmed live
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to fetch earnings: ${message}`, verified: false }, { status: 502 });
  }
}
