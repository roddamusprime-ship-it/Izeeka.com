import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})

export async function getTakes() {
  return sanityClient.fetch(`
    *[_type == "take" && defined(slug.current)] | order(publishedAt desc) {
      _id, title, slug, publishedAt, conviction, tickers, pullQuote, body
    }
  `)
}

export async function getTake(slug: string) {
  return sanityClient.fetch(`
    *[_type == "take" && slug.current == $slug][0] {
      _id, title, slug, publishedAt, conviction, tickers, pullQuote, body
    }
  `, { slug })
}

export async function getPositions() {
  return sanityClient.fetch(`
    *[_type == "position"] | order(ticker asc) {
      _id, ticker, addedPrice, addedDate, sector, conviction, notes
    }
  `)
}
