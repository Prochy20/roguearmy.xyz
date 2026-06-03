import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StatRibbon } from './StatRibbon'

const meta = {
  title: 'Components/UI/StatRibbon',
  component: StatRibbon,
  args: {
    prefix: '// SYNC',
    fields: [
      { label: 'level', value: '27' },
      { label: 'xp', value: '42,100', accent: 'cyan' },
      { label: 'rank', value: '#2' },
    ],
    pill: { text: 'ONLINE', mode: 'info' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StatRibbon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders the prefix, all field values and status pill', async () => {
      await expect(canvas.getByText('// SYNC')).toBeInTheDocument()
      await expect(canvas.getByText('27')).toBeInTheDocument()
      await expect(canvas.getByText('ONLINE')).toBeInTheDocument()
    })
  },
}

/**
 * Warn mode — yellow pulse. Soft attention: data exists but you should know
 * (STALE, MEMBERS-ONLY, freshness lag).
 */
export const PillWarn: Story = {
  args: {
    prefix: '// SYNC',
    fields: [{ label: 'last seen', value: '03:14:07 UTC' }],
    pill: { text: 'STALE', mode: 'warn' },
  },
}

/**
 * Error mode — rose pulse. Hard failure: content gone or unreachable
 * (LOCKED, OFFLINE, system error).
 */
export const PillError: Story = {
  args: {
    prefix: '// SYNC',
    fields: [{ label: 'last seen', value: '—' }],
    pill: { text: 'OFFLINE', mode: 'error' },
  },
}

export const ManyFields: Story = {
  args: {
    prefix: '// OPERATIVE',
    fields: [
      { label: 'tier', value: 'OPERATOR' },
      { label: 'level', value: '27' },
      { label: 'xp', value: '42,100', accent: 'cyan' },
      { label: 'rank', value: '#2' },
      { label: 'streak', value: '14d', accent: 'cyan' },
    ],
    pill: { text: 'SYNCED', mode: 'info' },
  },
}

/**
 * `trail` API — clickable breadcrumb segments left of the cluster split,
 * status fields + pill right. Leaf (last segment, no href) renders bright,
 * non-link.
 */
export const WithTrail: Story = {
  args: {
    prefix: undefined,
    trail: [
      { label: 'Division 2', href: '/division-2' },
      { label: 'Briefings', href: '/division-2/briefings' },
      { label: 'Washington' },
    ],
    fields: [
      { label: 'week', value: 'MAY 25' },
      { label: 'files', value: '05' },
      { label: 'tier', value: 'BOOSTER' },
    ],
    pill: { text: 'LIVE', mode: 'info' },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders trail segments and current page as non-link', async () => {
      await expect(canvas.getByRole('link', { name: /division 2/i })).toBeInTheDocument()
      await expect(canvas.getByRole('link', { name: /briefings/i })).toBeInTheDocument()
      const leaf = canvas.getByText('Washington')
      await expect(leaf).toHaveAttribute('aria-current', 'page')
    })
  },
}

/**
 * Mobile preview at 375px — trail collapses to the last two segments
 * (parent + leaf) so the top-level brand context drops out of the cramped
 * viewport. Status cluster wraps to its own line.
 */
export const WithTrailMobile: Story = {
  args: WithTrail.args,
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

/**
 * Weekly briefing detail style — leaf tinted cyan to read as an Ashley-output
 * document identifier. Fields stay neutral; chrome doesn't take game color,
 * so frequency is communicated by leaf tint + the `.md` text suffix.
 */
export const WithTrailBriefingDetail: Story = {
  args: {
    prefix: undefined,
    trail: [
      { label: 'Division 2', href: '/division-2' },
      { label: 'Briefings', href: '/division-2/briefings' },
      { label: 'W_2026-05-25.md', accent: 'cyan' },
    ],
    fields: [
      { label: 'freq', value: 'WEEKLY' },
      { label: 'period', value: 'MAY 25' },
      { label: 'sources', value: '12' },
      { label: 'updated', value: 'MAY 25' },
    ],
    pill: { text: 'PUBLIC', mode: 'info' },
  },
}

/**
 * Same chrome, members-only briefing — pill switches to `warn` (yellow pulse)
 * to signal the access gate. No other field changes.
 */
export const WithTrailBriefingMembers: Story = {
  args: {
    ...WithTrailBriefingDetail.args,
    pill: { text: 'MEMBERS', mode: 'warn' },
  },
}
