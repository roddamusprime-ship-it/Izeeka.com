import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('IZEEKA')
    .items([
      S.documentTypeListItem('take').title('Takes'),
      S.documentTypeListItem('position').title('Positions'),
    ])
