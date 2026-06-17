import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '2g872jzf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

export const dynamic = 'force-dynamic'

export async function GET() {
  const drafts = await client.fetch(
    `*[_id in path("drafts.**") && _type == "take"] | order(_createdAt desc) {
      _id, title, slug, publishedAt, conviction
    }`
  )
  return NextResponse.json(drafts)
}
