export type Sector = 'ai' | 'semi' | 'energy' | 'mega' | 'fin' | 'financial' | 'quantum' | 'space' | 'meme'

export const SECTOR_LABELS: Record<Sector, string> = {
  ai: 'AI/Tech',
  semi: 'Semiconductors',
  energy: 'Energy/Power',
  mega: 'Mega Cap',
  fin: 'Finance',
  financial: 'Financial',
  quantum: 'Quantum',
  space: 'Space',
  meme: 'Meme',
}

export const SECTOR_COLORS: Record<Sector, string> = {
  ai: '#a070ff',
  semi: '#4090ff',
  energy: '#40c060',
  mega: '#a0a090',
  fin: '#ff80b0',
  financial: '#e0c040',
  quantum: '#ff8040',
  space: '#40c8b0',
  meme: '#ffb830',
}

export const DEFAULT_TICKERS: Record<string, Sector> = {
  BE: 'energy', NOK: 'semi', ASML: 'semi', MU: 'semi',
  SMH: 'semi', CAT: 'mega', VRT: 'energy', NVDA: 'ai',
  AMD: 'ai', ARM: 'semi', AVGO: 'semi', TSM: 'semi',
  PLTR: 'ai', RKLB: 'space', ASTS: 'space', OKLO: 'energy',
  QBTS: 'quantum', IONQ: 'quantum', RGTI: 'quantum', NET: 'ai',
  DDOG: 'ai', APP: 'ai', MRVL: 'semi', SNDK: 'semi',
  WDC: 'semi', LITE: 'semi', COHR: 'semi', AXTI: 'semi',
  GEV: 'energy', GS: 'financial', MSTR: 'financial', HOOD: 'fin',
  TSLA: 'mega', AAPL: 'mega', MSFT: 'mega', GOOG: 'mega',
  AMZN: 'mega', META: 'mega',
}
