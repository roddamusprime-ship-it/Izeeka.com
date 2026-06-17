import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '2g872jzf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const drafts = await client.fetch('*[_id in path("drafts.**") && _type == "take"]{_id, title}')

if (drafts.length === 0) {
  console.log('No draft takes to publish.')
  process.exit(0)
}

console.log(`Found ${drafts.length} draft(s) to publish:`)
drafts.forEach((d: any) => console.log(`  - ${d.title}`))

for (const draft of drafts) {
  const doc = await client.fetch(`*[_id == "${draft._id}"][0]`)
  const published = { ...doc, _id: doc._id.replace('drafts.', '') }
  await client.createOrReplace(published)
  await client.delete(draft._id)
  console.log(`✓ Published: ${draft.title}`)
}

console.log('Done!')
