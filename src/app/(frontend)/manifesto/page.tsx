import type { Metadata } from 'next'
import { ManifestoPage } from './ManifestoPage'
import { getManifestoDocs } from './getManifestoDocs'

export const metadata: Metadata = {
  title: 'Manifesto · Rules, Privacy & Terms | Rogue Army',
  description:
    'Community rules, privacy policy, and terms of use for Rogue Army — a casual gaming community for adults 25+.',
}

export default async function ManifestoRoute() {
  const docs = await getManifestoDocs()
  return <ManifestoPage docs={docs} />
}
