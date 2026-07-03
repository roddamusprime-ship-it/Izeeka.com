// app/api/options-chain/route.ts
//
// GET /api/options-chain?ticker=NVDA&type=put&deltaMin=0.15&deltaMax=0.30
//
// Fetches the full options chain snapshot for a ticker from Massive
// (formerly Polygon.io), filters to a delta range and contract type,
// buckets by timeframe, and returns grouped JSON for the frontend
// wheel-screener table.
//
// NOTE: this project is on Next.js 16.2.9, which the repo's AGENTS.md
// flags as having breaking changes vs. typical training-data patterns
// for route handlers. Check node_modules/next/dist/docs/ (or the
// installed Next.js changelog) before assuming the signatures below
// — request/response handling, revalidate config, or the route
// segment config format may differ from what's written here.

import { NextRequest, NextResponse } from "next/server";
import {
  enrichContract,
  groupByTimeframe,
  inDeltaRange,
  type OptionContract,
} from "@/lib/options";

// Cache each ticker's chain for 15 minutes. Options chains are large
// (can be 1000+ contracts across expirations) and this endpoint pages
// through all of them, so caching matters both for rate limits and
// for response time.
export const revalidate = 900;

const MASSIVE_BASE_URL = "https://api.polygon.io"; // Massive kept the Polygon API host after the rebrand as of last verification — confirm this is still current before relying on it.

interface MassiveOptionResult {
  details: {
    contract_type: "call" | "put";
    exercise_style: string;
    expiration_date: string;
    shares_per_contract: number;
    strike_price: number;
    ticker: string;
  };
  greeks?: {
    delta?: number;
    gamma?: number;
    theta?: number;
    vega?: number;
  };
  implied_volatility?: number;
  open_interest?: number;
  last_quote?: {
    bid?: number;
    ask?: number;
    midpoint?: number;
  };
  last_trade?: {
    price?: number;
  };
  underlying_asset?: {
    price?: number;
    ticker?: string;
  };
}

interface MassiveSnapshotResponse {
  results?: MassiveOptionResult[];
  next_url?: string;
  status?: string;
  error?: string;
}

function toOptionContract(
  result: MassiveOptionResult,
  underlyingPrice: number
): OptionContract | null {
  const { details, greeks, last_quote } = result;
  if (!details) return null;

  const bid = last_quote?.bid ?? null;
  const ask = last_quote?.ask ?? null;
  // Prefer bid/ask midpoint; fall back to last trade price; skip the
  // contract entirely if neither is available since premium is the
  // whole point of this screener.
  const premium =
    last_quote?.midpoint ??
    (bid !== null && ask !== null ? (bid + ask) / 2 : null) ??
    result.last_trade?.price ??
    null;

  if (premium === null) return null;

  return {
    ticker: result.underlying_asset?.ticker ?? "",
    contractSymbol: details.ticker,
    contractType: details.contract_type,
    strike: details.strike_price,
    expirationDate: details.expiration_date,
    premium,
    bid,
    ask,
    delta: greeks?.delta ?? null,
    gamma: greeks?.gamma ?? null,
    theta: greeks?.theta ?? null,
    vega: greeks?.vega ?? null,
    impliedVolatility: result.implied_volatility ?? null,
    openInterest: result.open_interest ?? null,
    underlyingPrice,
  };
}

async function fetchFullChain(ticker: string, apiKey: string): Promise<MassiveOptionResult[]> {
  const results: MassiveOptionResult[] = [];
  let url: string | null =
    `${MASSIVE_BASE_URL}/v3/snapshot/options/${encodeURIComponent(ticker)}?limit=250&apiKey=${apiKey}`;

  // Massive/Polygon paginates large chains via next_url. next_url
  // already includes auth in some Polygon responses and not others
  // historically — append apiKey defensively if it's missing.
  let pageCount = 0;
  const MAX_PAGES = 20; // safety cap so a runaway pagination loop can't burn the whole rate limit budget in one request

  while (url && pageCount < MAX_PAGES) {
    const res: Response = await fetch(url, { cache: "no-store" });

    if (res.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    if (!res.ok) {
      throw new Error(`MASSIVE_HTTP_${res.status}`);
    }

    const data: MassiveSnapshotResponse = await res.json();
    if (data.error) {
      throw new Error(`MASSIVE_API_ERROR: ${data.error}`);
    }
    if (data.results) {
      results.push(...data.results);
    }

    url = data.next_url ? (data.next_url.includes("apiKey=") ? data.next_url : `${data.next_url}&apiKey=${apiKey}`) : null;
    pageCount += 1;
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const contractType = searchParams.get("type"); // "call" | "put" | null (both)
  const deltaMin = parseFloat(searchParams.get("deltaMin") ?? "0.15");
  const deltaMax = parseFloat(searchParams.get("deltaMax") ?? "0.30");

  if (!ticker) {
    return NextResponse.json({ error: "Missing required query param: ticker" }, { status: 400 });
  }
  if (contractType && contractType !== "call" && contractType !== "put") {
    return NextResponse.json({ error: 'type must be "call" or "put"' }, { status: 400 });
  }

  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: POLYGON_API_KEY not set" },
      { status: 500 }
    );
  }

  let rawResults: MassiveOptionResult[];
  try {
    rawResults = await fetchFullChain(ticker, apiKey);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "RATE_LIMITED") {
      return NextResponse.json(
        { error: "Rate limited by Massive API, try again shortly" },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: `Failed to fetch options chain: ${message}` }, { status: 502 });
  }

  if (rawResults.length === 0) {
    return NextResponse.json(
      { error: `No options data returned for ${ticker}` },
      { status: 404 }
    );
  }

  const underlyingPrice = rawResults[0]?.underlying_asset?.price ?? 0;

  // Optionally pull an earnings date to flag in-window contracts.
  // This is a soft dependency: if the earnings route fails or the
  // endpoint isn't verified yet, we still return the chain — just
  // without the earnings flag set.
  let earningsDate: string | null = null;
  try {
    const earningsRes = await fetch(
      `${request.nextUrl.origin}/api/earnings?ticker=${encodeURIComponent(ticker)}`,
      { cache: "no-store" }
    );
    if (earningsRes.ok) {
      const earningsData = await earningsRes.json();
      earningsDate = earningsData.nextEarningsDate ?? null;
    }
  } catch {
    // Swallow — earnings is best-effort here, not fetched independently by the frontend.
  }

  const enriched = rawResults
    .map((r) => toOptionContract(r, underlyingPrice))
    .filter((c): c is OptionContract => c !== null)
    .filter((c) => !contractType || c.contractType === contractType)
    .filter((c) => inDeltaRange(c.delta, deltaMin, deltaMax))
    .map((c) => enrichContract(c, earningsDate));

  const grouped = groupByTimeframe(enriched);

  return NextResponse.json({
    ticker,
    underlyingPrice,
    earningsDate,
    deltaRange: { min: deltaMin, max: deltaMax },
    contractType: contractType ?? "both",
    contractCount: enriched.length,
    buckets: grouped,
  });
}
