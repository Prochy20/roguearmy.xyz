import type { Metadata } from 'next'
import { ManifestoPage } from '../manifesto/ManifestoPage'
import { getManifestoDocs } from '../manifesto/getManifestoDocs'

export const metadata: Metadata = {
  title: 'Privacy Policy | Rogue Army',
  description:
    'What we collect and why. In plain English: we\'re a small gaming community, not an ad network.',
}

export default async function PrivacyRoute() {
  const docs = await getManifestoDocs()
  return <ManifestoPage docs={docs} singleDoc="privacy" />
}
