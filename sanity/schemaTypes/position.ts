export const position = {
  name: 'position',
  title: 'Position',
  type: 'document',
  fields: [
    { name: 'ticker', title: 'Ticker', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'addedPrice', title: 'Price When Added', type: 'number', validation: (Rule: any) => Rule.required() },
    { name: 'addedDate', title: 'Date Added', type: 'date', validation: (Rule: any) => Rule.required() },
    { name: 'sector', title: 'Sector', type: 'string', options: { list: [{ title: 'AI / Tech', value: 'ai' }, { title: 'Semiconductors', value: 'semi' }, { title: 'Energy / Power', value: 'energy' }, { title: 'Mega Cap', value: 'mega' }, { title: 'Finance', value: 'fin' }, { title: 'Financial', value: 'financial' }, { title: 'Quantum', value: 'quantum' }, { title: 'Space', value: 'space' }, { title: 'Meme', value: 'meme' }], layout: 'dropdown' }, validation: (Rule: any) => Rule.required() },
    { name: 'conviction', title: 'Conviction', type: 'string', options: { list: [{ title: '◆ Strong Bull', value: 'strong_bull' }, { title: '▲ Bull', value: 'bull' }, { title: '— Hold', value: 'hold' }, { title: '▼ Bear', value: 'bear' }], layout: 'radio' }, validation: (Rule: any) => Rule.required() },
    { name: 'notes', title: 'Thesis Notes', type: 'text', description: 'Private thesis note — shown on site.', rows: 3 },
  ],
  preview: { select: { title: 'ticker', subtitle: 'sector' } },
}
