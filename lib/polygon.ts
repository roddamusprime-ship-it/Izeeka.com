const BASE = 'https://api.polygon.io'
const KEY = process.env.POLYGON_API_KEY

const cache: Record<string, { data: any; ts: number }> = {}
const TTL = 60 * 1000

async function fetcher(url: string) {
  const now = Date.now()
  if (cache[url] && now - cache[url].ts < TTL) return cache[url].data
  const res = await fetch(url)
  const json = await res.json()
  cache[url] = { data: json, ts: now }
  return json
}

export async function getPrevClose(ticker: string) {
  const url = `${BASE}/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${KEY}`
  const json = await fetcher(url)
  const result = json.results?.[0]
  if (!result) return null
  return {
    ticker,
    close: result.c,
    open: result.o,
    high: result.h,
    low: result.l,
    volume: result.v,
    changePercent: ((result.c - result.o) / result.o) * 100,
  }
}

export async function getBatchQuotes(tickers: string[]) {
  const results = await Promise.allSettled(tickers.map(t => getPrevClose(t)))
  return results
    .map((r, i) => r.status === 'fulfilled' ? r.value : { ticker: tickers[i], error: true })
    .filter(Boolean)
}
