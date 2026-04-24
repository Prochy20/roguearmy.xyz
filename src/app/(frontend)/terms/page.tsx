import type { Metadata } from 'next'
import { ManifestoPage } from '../manifesto/ManifestoPage'
import { getManifestoDocs } from '../manifesto/getManifestoDocs'

export const metadata: Metadata = {
  title: 'Terms of Use | Rogue Army',
  description:
    'A contract between you and a volunteer gaming community. Not written by lawyers. Worth reading anyway.',
}

export default async function TermsRoute() {
  const docs = await getManifestoDocs()
  return <ManifestoPage docs={docs} singleDoc="terms" />
}
