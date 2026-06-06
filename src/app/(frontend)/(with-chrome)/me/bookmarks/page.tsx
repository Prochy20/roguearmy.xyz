import { redirect } from 'next/navigation'
import { getMemberAuth } from '@/lib/auth/session.server'
import { getMemberBookmarks } from '@/lib/bookmarks.server'
import { BookmarksList } from '@/components/me/BookmarksList'
import { SectionHeader } from '@/components/me/SectionHeader'
import { StatRibbon } from '@/components/ui/StatRibbon'
import { ME_ROOT } from '@/components/ui/trail-roots'
import '../me.css'

export const metadata = {
  title: 'Saved | Rogue Army',
  description: 'Your saved articles and Washington Briefings.',
}

export default async function MeBookmarksPage() {
  const auth = await getMemberAuth()
  if (!auth.authenticated || !auth.memberId) {
    redirect('/auth/login?returnTo=/me/bookmarks')
  }

  // React.cache dedups vs the chrome layout's earlier call in this request.
  const bookmarks = await getMemberBookmarks({
    memberId: auth.memberId,
    symbolicRoles: auth.symbolicRoles,
  })

  const total = bookmarks.length
  const articleCount = bookmarks.filter((b) => b.targetType === 'article').length
  const briefingCount = total - articleCount

  return (
    <div>
      <div className="mx-auto w-full max-w-[1480px] mt-20 sm:mt-24 lg:mt-28 px-4 sm:px-8 lg:sticky lg:top-[21px] lg:z-40 lg:mx-0 lg:max-w-none lg:pl-16 lg:pr-[140px]">
        <StatRibbon
          trail={[ME_ROOT, { label: 'Bookmarks' }]}
          fields={[
            { label: 'SAVED', value: String(total).padStart(2, '0') },
            { label: 'ARTICLES', value: String(articleCount).padStart(2, '0') },
            { label: 'BRIEFINGS', value: String(briefingCount).padStart(2, '0') },
          ]}
          pill={
            total > 0
              ? { text: 'VAULT', mode: 'info' }
              : { text: 'EMPTY', mode: 'info' }
          }
        />
      </div>

      <main className="mx-auto w-full max-w-[1480px] px-4 pt-10 pb-20 sm:px-8 sm:pt-14 sm:pb-28 lg:px-16 lg:pt-20 lg:pb-36">
        <section className="me-fade me-fade--01">
          <SectionHeader
            num="01"
            eyebrow="SAVED"
            kicker="// saved for later"
            title="BOOKMARKS"
          />
          <BookmarksList />
        </section>
      </main>
    </div>
  )
}
