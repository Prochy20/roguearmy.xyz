import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  getArticleBySlug,
  getCategoryTintClasses,
  formatArticleDate,
  MOCK_ARTICLES,
} from '@/lib/articles'
import { CyberButton } from '@/components/members/CyberButton'
import { cn } from '@/lib/utils'
import { ArticleHero } from './ArticleHero'
import { ArticleContent } from './ArticleContent'
import { BackToTop } from './BackToTop'
import { ScrollBackButton } from './ScrollBackButton'
import { ReadingStatus } from './ReadingStatus'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return MOCK_ARTICLES.map((article) => ({
    slug: article.slug,
  }))
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const tint = getCategoryTintClasses(article.category.tint)

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Reading status bar - bottom of screen */}
      <ReadingStatus readingTime={article.readingTime} />

      {/* Background atmospheric effects */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 100% 50% at 0% 0%, rgba(0,255,65,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 40% at 100% 100%, rgba(0,255,255,0.06) 0%, transparent 40%),
            radial-gradient(ellipse 60% 30% at 50% 50%, rgba(255,0,255,0.04) 0%, transparent 40%)
          `,
        }}
      />

      {/* Floating nav - appears on scroll */}
      <ScrollBackButton />

      {/* Hero Section - Full viewport */}
      <ArticleHero
        title={article.title}
        heroImage={article.heroImage}
        category={article.category}
        tint={tint}
        publishedAt={article.publishedAt}
        readingTime={article.readingTime}
        tags={article.tags}
      />

      {/* Content Section */}
      <main className="relative z-10">
        {/* Transition gradient from hero */}
        <div className="h-32 bg-gradient-to-b from-transparent to-void -mt-32 relative z-20" />

        {/* Article Body - Full width with internal rhythm */}
        <div className="bg-void relative">
          {/* Left accent line */}
          <div
            className={cn(
              'absolute left-0 top-0 bottom-0 w-1 hidden lg:block',
              'bg-gradient-to-b from-transparent via-current to-transparent opacity-20',
              tint.text
            )}
          />

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,720px)_1fr] gap-8 px-6 md:px-12 lg:px-0">
            {/* Left margin - decorative on large screens */}
            <div className="hidden lg:flex flex-col items-end pt-12 pr-8">
              <div className="sticky top-24 space-y-6">
                {/* Reading progress indicator placeholder */}
                <div className="w-px h-24 bg-gradient-to-b from-rga-green/50 to-transparent" />

                {/* Decorative grid pattern */}
                <div className="grid grid-cols-3 gap-1 opacity-20">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-sm',
                        i % 3 === 0 ? 'bg-rga-green' : 'bg-rga-gray/30'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <article className="py-12 lg:py-16">
              <ArticleContent content={article.content} />

              {/* Article footer */}
              <footer className="mt-20 pt-8 border-t border-rga-green/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CyberButton
                    href="/members"
                    iconLeft={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back to all articles
                  </CyberButton>

                  <BackToTop />
                </div>
              </footer>
            </article>

            {/* Right margin - metadata on large screens */}
            <div className="hidden lg:block pt-12 pl-8">
              <div className="sticky top-24 space-y-8">
                {/* Mini metadata card */}
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-rga-gray/40 uppercase tracking-wider text-xs">
                      Published
                    </span>
                    <p className="text-rga-gray mt-1">
                      {formatArticleDate(article.publishedAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-rga-gray/40 uppercase tracking-wider text-xs">
                      Reading time
                    </span>
                    <p className="text-rga-gray mt-1">
                      {article.readingTime} minutes
                    </p>
                  </div>
                  <div>
                    <span className="text-rga-gray/40 uppercase tracking-wider text-xs">
                      Category
                    </span>
                    <p className={cn('mt-1', tint.text)}>
                      {article.category.name}
                    </p>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="w-16 h-px bg-gradient-to-r from-rga-green/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom fade */}
      <div className="h-32 bg-gradient-to-t from-void to-transparent" />
    </div>
  )
}
