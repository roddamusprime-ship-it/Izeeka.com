// lib/options.ts
//
// Pure helper functions for the wheel-strategy options screener.
// No network calls here — this file just transforms option contract
// data that's already been fetched (see app/api/options-chain/route.ts).

export type TimeframeBucket =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarter"
  | "half_year"
  | "leaps";

export interface OptionContract {
  ticker: string; // underlying ticker, e.g. "NVDA"
  contractSymbol: string; // OCC symbol, e.g. "O:NVDA250815C00120000"
  contractType: "call" | "put";
  strike: number;
  expirationDate: string; // ISO date, "2025-08-15"
  premium: number; // mid price of bid/ask, or last trade if no quote
  bid: number | null;
  ask: number | null;
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  impliedVolatility: number | null;
  openInterest: number | null;
  underlyingPrice: number;
}

export interface EnrichedContract extends OptionContract {
  daysToExpiration: number;
  timeframe: TimeframeBucket;
  annualizedReturnPct: number;
  distanceFromSpotPct: number;
  earningsInWindow: boolean;
}

/**
 * Days between now and the contract's expiration date.
 * Uses UTC midnight boundaries so this is stable regardless of
 * what time of day the request comes in.
 */
export function daysToExpiration(expirationDate: string, from: Date = new Date()): number {
  const exp = new Date(`${expirationDate}T00:00:00Z`);
  const fromMidnight = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  );
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((exp.getTime() - fromMidnight.getTime()) / msPerDay);
}

/**
 * Buckets a contract into a timeframe based on days-to-expiration.
 * Boundaries:
 *   weekly    0–9 days
 *   biweekly  10–16 days
 *   monthly   17–45 days
 *   quarter   46–120 days
 *   half_year 121–210 days
 *   leaps     211+ days
 * These are intentionally loose — real expirations don't fall on
 * exact weekly boundaries, so bucket by "closest fit" range instead
 * of exact day counts.
 */
export function bucketTimeframe(dte: number): TimeframeBucket {
  if (dte <= 9) return "weekly";
  if (dte <= 16) return "biweekly";
  if (dte <= 45) return "monthly";
  if (dte <= 120) return "quarter";
  if (dte <= 210) return "half_year";
  return "leaps";
}

/**
 * Simple annualized return for a cash-secured put or covered call,
 * expressed as a percentage. This is the naive "premium collected /
 * capital at risk, annualized" calc — it does NOT account for
 * assignment risk, early exercise, or compounding.
 *
 * For a CSP: capital at risk = strike * 100 per contract.
 * For a covered call held against shares you already own, the same
 * formula is used against the strike as a stand-in for capital basis;
 * callers can substitute cost basis instead if they want a return-on-
 * cost-basis number instead of return-on-strike.
 */
export function annualizedReturnPct(
  premium: number,
  strike: number,
  dte: number
): number {
  if (strike <= 0 || dte <= 0) return 0;
  return (premium / strike) * (365 / dte) * 100;
}

/**
 * How far the strike is from the current underlying price, as a
 * signed percentage. Negative means the strike is below spot
 * (typical for a CSP), positive means above spot (typical for a
 * covered call).
 */
export function distanceFromSpotPct(strike: number, underlyingPrice: number): number {
  if (underlyingPrice <= 0) return 0;
  return ((strike - underlyingPrice) / underlyingPrice) * 100;
}

/**
 * Whether an earnings date falls inside [today, expirationDate].
 * Pass null/undefined earningsDate if it's unknown — this returns
 * false in that case rather than throwing, since earnings data comes
 * from a separate, unverified endpoint and may not always be present.
 */
export function isEarningsInWindow(
  expirationDate: string,
  earningsDate: string | null | undefined,
  from: Date = new Date()
): boolean {
  if (!earningsDate) return false;
  const exp = new Date(`${expirationDate}T00:00:00Z`);
  const earnings = new Date(`${earningsDate}T00:00:00Z`);
  const fromMidnight = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  );
  return earnings.getTime() >= fromMidnight.getTime() && earnings.getTime() <= exp.getTime();
}

/**
 * Filters contracts to a delta range. Delta is signed for puts
 * (negative) and unsigned for calls in most feeds, including
 * Massive/Polygon's options snapshot — this compares on absolute
 * value so callers can pass a positive range like { min: 0.15, max: 0.30 }
 * regardless of contract type.
 */
export function inDeltaRange(
  delta: number | null,
  min: number,
  max: number
): boolean {
  if (delta === null) return false;
  const abs = Math.abs(delta);
  return abs >= min && abs <= max;
}

/**
 * Full enrichment pipeline: takes a raw contract + optional earnings
 * date and returns everything the frontend table needs to render a
 * row, in one call.
 */
export function enrichContract(
  contract: OptionContract,
  earningsDate: string | null | undefined,
  from: Date = new Date()
): EnrichedContract {
  const dte = daysToExpiration(contract.expirationDate, from);
  return {
    ...contract,
    daysToExpiration: dte,
    timeframe: bucketTimeframe(dte),
    annualizedReturnPct: annualizedReturnPct(contract.premium, contract.strike, dte),
    distanceFromSpotPct: distanceFromSpotPct(contract.strike, contract.underlyingPrice),
    earningsInWindow: isEarningsInWindow(contract.expirationDate, earningsDate, from),
  };
}

/**
 * Groups a flat list of enriched contracts by timeframe bucket, in
 * the fixed display order the frontend expects.
 */
export function groupByTimeframe(
  contracts: EnrichedContract[]
): Record<TimeframeBucket, EnrichedContract[]> {
  const order: TimeframeBucket[] = [
    "weekly",
    "biweekly",
    "monthly",
    "quarter",
    "half_year",
    "leaps",
  ];
  const grouped = Object.fromEntries(order.map((k) => [k, []])) as Record<
    TimeframeBucket,
    EnrichedContract[]
  >;
  for (const c of contracts) {
    grouped[c.timeframe].push(c);
  }
  // Sort each bucket by strike ascending for a stable table order.
  for (const k of order) {
    grouped[k].sort((a, b) => a.strike - b.strike);
  }
  return grouped;
}
