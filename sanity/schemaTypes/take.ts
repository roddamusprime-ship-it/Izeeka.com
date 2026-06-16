export const take = {
  name: 'take',
  title: 'Take',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule: any) => Rule.required() },
    { name: 'publishedAt', title: 'Published At', type: 'datetime', validation: (Rule: any) => Rule.required() },
    { name: 'conviction', title: 'Conviction', type: 'string', options: { list: [{ title: '🐂 Bull', value: 'bull' }, { title: '🐻 Bear', value: 'bear' }, { title: '😐 Neutral', value: 'neutral' }], layout: 'radio' }, validation: (Rule: any) => Rule.required() },
    { name: 'tickers', title: 'Tickers Mentioned', type: 'array', of: [{ type: 'string' }], description: 'e.g. NVDA, RKLB, QBTS' },
    { name: 'pullQuote', title: 'T-Dubbs Says', type: 'string', description: 'The pullquote callout — make it based.' },
    { name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }], validation: (Rule: any) => Rule.required() },
  ],
  preview: { select: { title: 'title', subtitle: 'publishedAt' } },
}
