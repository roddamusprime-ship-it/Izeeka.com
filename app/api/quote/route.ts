import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker') || 'SPCX'
  const key = process.env.POLYGON_API_KEY
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${key}`

  try {
    const res = await fetch(url)
    const json = await res.json()
    console.log('Polygon response:', JSON.stringify(json).slice(0, 200))
    const result = json.results?.[0]
    if (!result) return NextResponse.json(null)
    return NextResponse.json({
      ticker,
      close: result.c,
      open: result.o,
      high: result.h,
      low: result.l,
      volume: result.v,
    })
  } catch (e) {
    console.error('Quote fetch error:', e)
    return NextResponse.json(null)
  }
}
