import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderPageShell } from './ReaderPageShell'
import { ReaderBreadcrumb } from './ReaderBreadcrumb'
import { ReaderHeroFrame } from './ReaderHeroFrame'
import { ReaderTitleBlock } from './ReaderTitleBlock'
import { ReaderActions } from './ReaderActions'
import { ReaderDocStrip } from './ReaderDocStrip'
import { ReaderTldrCard } from './ReaderTldrCard'
import { ReaderBody } from './ReaderBody'
import { ReaderToc } from './ReaderToc'
import { ReaderReadingWidget } from './ReaderReadingWidget'
import { ReaderShortcuts } from './ReaderShortcuts'
import { ReaderDetailFooter } from './ReaderDetailFooter'
import { StatRibbon } from '@/components/ui/StatRibbon'
import { BLOG_ROOT } from '@/components/ui/trail-roots'
import type { AccentName } from './accent'

const SAMPLE_SECTIONS = [
  { num: 1, numLabel: '01', text: 'Highlights', id: 'sec-01' },
  { num: 2, numLabel: '02', text: 'Vendor Rotation', id: 'sec-02' },
  { num: 3, numLabel: '03', text: 'Mission Pacing', id: 'sec-03' },
]

const SAMPLE_BODY_MD = `<h2 id="sec-01" data-sec-num="01">Highlights</h2>

This week was about consolidation. Three things shifted: vendor cache,
patch notes, and a route fix.

<h2 id="sec-02" data-sec-num="02">Vendor Rotation</h2>

Protocol vendor swapped to **Holster + Rifle** slots.

<h2 id="sec-03" data-sec-num="03">Mission Pacing</h2>

Capitol still farms hardest before resets.
`

function buildSlots(accent: AccentName) {
  return {
    header: (
      <>
        <ReaderBreadcrumb
          accent={accent}
          trail={[
            { href: '/division-2', label: 'DIVISION 2' },
            { href: '/division-2/briefings', label: 'BRIEFINGS' },
          ]}
          designator="WK21_2026"
        />
        <ReaderTitleBlock
          accent={accent}
          title="WEEK 21 · ESCALATION ROLL-UP"
          perex="Five missions, new vendor caches, and the meta shift."
          dateLabel="WEEK OF MAY 19"
          readMinutes={8}
          actions={<ReaderActions accent={accent} />}
        />
        <ReaderHeroFrame
          accent={accent}
          thumbnailUrl="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=70"
          kindLabel="WEEKLY"
          periodLabel="MAY 19 → MAY 25"
          bylineLabel="// AI · ASHLEY"
        />
      </>
    ),
    toc: <ReaderToc accent={accent} sections={SAMPLE_SECTIONS} />,
    body: (
      <div className="flex flex-col gap-8 sm:gap-10">
        <ReaderDocStrip
          accent={accent}
          fields={[
            { label: 'DOC', value: 'WK21_2026', tone: 'accent' },
            { label: 'CLASS', value: 'WEEKLY', tone: 'muted' },
            { label: 'WORDS', value: '2,108', tone: 'secondary' },
            { label: 'UPDATED', value: 'MAY 26', tone: 'secondary' },
          ]}
        />
        <ReaderTldrCard
          accent={accent}
          highlights={[
            'Tidal Basin remains the top XP-per-hour run.',
            'Vendor cache rotated to Holster + Rifle.',
            'Patch 23.5 favors backline marksman roles.',
          ]}
        />
        <article className="reader-body min-w-0">
          <ReaderBody
            accent={accent}
            source={{ type: 'markdown', content: SAMPLE_BODY_MD }}
            sections={SAMPLE_SECTIONS}
          />
        </article>
      </div>
    ),
    reading: (
      <div className="flex flex-col gap-5">
        <ReaderReadingWidget accent={accent} wordCount={2108} />
        <ReaderShortcuts accent={accent} />
      </div>
    ),
    footer: (
      <ReaderDetailFooter
        accent={accent}
        backHref="/division-2/briefings?week=2026-05-19"
        backLabel="WEEK"
        backValue="MAY 19"
        prev={{ href: '/division-2/briefings/daily-may-18-d1d1d1d1', label: 'DAILY', sublabel: 'MAY 18' }}
        next={{ href: '/division-2/briefings/weekly-may-26-d2d2d2d2', label: 'WEEKLY', sublabel: 'MAY 26' }}
      />
    ),
  }
}

const meta: Meta<typeof ReaderPageShell> = {
  title: 'Components/Content/Reader/ReaderPageShell',
  component: ReaderPageShell,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: { accent: 'cyan' },
}
export default meta
type Story = StoryObj<typeof meta>

/** Briefing-flavored composition — cyan weekly with ToC + full chrome. */
export const Default: Story = {
  render: (args) => {
    const slots = buildSlots(args.accent)
    return <ReaderPageShell {...args} {...slots} />
  },
}

/** Article-flavored composition — green topic, article footer. */
export const Article: Story = {
  args: { accent: 'green' },
  render: (args) => {
    const slots = buildSlots(args.accent)
    return (
      <ReaderPageShell
        {...args}
        {...slots}
        footer={
          <ReaderDetailFooter
            accent={args.accent}
            backHref="/blog/builds"
            backLabel="BUILDS"
            backValue="MAY 20"
            prev={{ href: '/blog/builds/prev', label: 'BUILDS', sublabel: 'MAY 18' }}
            next={{ href: '/blog/builds/next', label: 'BUILDS', sublabel: 'MAY 22' }}
          />
        }
      />
    )
  },
}

/** Body-only — when sections is empty, the ToC slot is null and the layout
 * collapses to two columns (body + reading rail). */
export const NoToc: Story = {
  render: (args) => {
    const slots = buildSlots(args.accent)
    return <ReaderPageShell {...args} {...slots} toc={null} />
  },
}

/**
 * New `stickyChrome` slot — pages pass a `StatRibbon` (or any chrome row) and
 * the shell renders it OUTSIDE the body's max-w grid so it can stretch toward
 * the fixed Header's MENU button. At <lg it renders inline; from lg+ it
 * sticks at the MENU-button vertical center (top:21) and remains in view
 * while the reader scrolls. Drop ReaderBreadcrumb from the header slot — the
 * trail leaf carries the doc identifier instead.
 */
export const WithStickyChrome: Story = {
  render: (args) => {
    const slots = buildSlots(args.accent)
    return (
      <ReaderPageShell
        {...args}
        {...slots}
        // Replace the legacy header that opened with ReaderBreadcrumb — the
        // new pattern moves location into the trail and the designator into
        // its leaf, so the header slot is title + hero only.
        header={
          <>
            <ReaderTitleBlock
              accent={args.accent}
              title="WEEK 21 · ESCALATION ROLL-UP"
              perex="Five missions, new vendor caches, and the meta shift."
              dateLabel="WEEK OF MAY 19"
              readMinutes={8}
              actions={<ReaderActions accent={args.accent} />}
            />
            <ReaderHeroFrame
              accent={args.accent}
              thumbnailUrl="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=70"
              kindLabel="WEEKLY"
              periodLabel="MAY 19 → MAY 25"
              bylineLabel="// AI · ASHLEY"
            />
          </>
        }
        stickyChrome={
          <StatRibbon
            trail={[
              BLOG_ROOT,
              { label: 'Builds', href: '/blog/builds' },
              { label: 'WK21_2026.md', accent: 'cyan' },
            ]}
            fields={[
              { label: 'READ', value: '8 MIN', accent: 'cyan' },
              { label: 'PUBLISHED', value: 'May 19', accent: 'green' },
            ]}
            pill={{ text: 'PUBLIC', ok: true, accent: 'green' }}
          />
        }
      />
    )
  },
}
