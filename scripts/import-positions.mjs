import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

const client = createClient({
  projectId: '2g872jzf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const csvPath = path.join(process.env.HOME, 'Desktop', 'Positions.csv')
const csv = fs.readFileSync(csvPath, 'utf8')
const lines = csv.split('\n').map(l => l.replace(/\r/g, ''))

const headerIndex = lines.findIndex(l => l.startsWith('Symbol'))
if (headerIndex === -1) { console.error('Could not find header row'); process.exit(1) }

const headers = lines[headerIndex].split(',')
const symIdx = headers.indexOf('Symbol')
const priceIdx = headers.indexOf('Price When Added')
const dateIdx = headers.indexOf('Date Added')

const dataLines = lines.slice(headerIndex + 1).filter(l => {
  const cols = l.split(',')
  return cols[symIdx] && cols[symIdx].trim() !== '' && cols[priceIdx] && !isNaN(parseFloat(cols[priceIdx]))
})

console.log(`Found ${dataLines.length} positions to import...`)

for (const line of dataLines) {
  const cols = line.split(',')
  const ticker = cols[symIdx].trim()
  const addedPrice = parseFloat(cols[priceIdx])
  const rawDate = cols[dateIdx]?.trim()

  let addedDate = '2024-01-01'
  if (rawDate) {
    const parts = rawDate.split('/')
    if (parts.length === 3) {
      addedDate = `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}`
    }
  }

  const doc = {
    _type: 'position',
    ticker,
    addedPrice,
    addedDate,
    sector: 'ai',
    conviction: 'bull',
    notes: '',
  }

  try {
    const result = await client.create(doc)
    console.log(`✓ Created ${ticker} (${result._id})`)
  } catch(e) {
    console.error(`✗ Failed ${ticker}:`, e.message)
  }
}

console.log('Done! All positions imported.')
