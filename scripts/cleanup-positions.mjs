import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '2g872jzf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const docs = await client.fetch('*[_type == "position"]{ _id }')
console.log(`Found ${docs.length} position documents to delete...`)

for (const doc of docs) {
  await client.delete(doc._id)
  console.log(`✓ Deleted ${doc._id}`)
}

console.log('Done! All positions cleared.')
