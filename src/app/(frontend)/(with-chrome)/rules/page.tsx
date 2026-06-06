import type { Metadata } from 'next'
import { ManifestoPage } from '../manifesto/ManifestoPage'
import { getManifestoDocs } from '../manifesto/getManifestoDocs'

export const metadata: Metadata = {
  title: 'Community Rules | Rogue Army',
  description:
    'Nine rules. Short enough to read, specific enough to enforce. The house rules of Rogue Army gaming community.',
}

export default async function RulesRoute() {
  const docs = await getManifestoDocs()
  return <ManifestoPage docs={docs} singleDoc="rules" />
}
