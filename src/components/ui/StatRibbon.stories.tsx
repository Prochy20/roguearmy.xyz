import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StatRibbon } from './StatRibbon'

const meta = {
  title: 'Components/UI/StatRibbon',
  component: StatRibbon,
  args: {
    prefix: '// SYNC',
    fields: [
      { label: 'level', value: '27', accent: 'green' },
      { label: 'xp', value: '42,100', accent: 'cyan' },
      { label: 'rank', value: '#2', accent: 'mod' },
    ],
    pill: { text: 'ONLINE', ok: true, accent: 'green' },
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

export const StatusFailing: Story = {
  args: {
    prefix: '// SYNC',
    fields: [{ label: 'last seen', value: '03:14:07 UTC' }],
    pill: { text: 'STALE', ok: false, accent: 'magenta' },
  },
}

export const ManyFields: Story = {
  args: {
    prefix: '// OPERATIVE',
    fields: [
      { label: 'tier', value: 'OPERATOR', accent: 'green' },
      { label: 'level', value: '27', accent: 'green' },
      { label: 'xp', value: '42,100', accent: 'cyan' },
      { label: 'rank', value: '#2', accent: 'mod' },
      { label: 'streak', value: '14d', accent: 'cyan' },
    ],
    pill: { text: 'SYNCED', ok: true, accent: 'green' },
  },
}

/**
 * New `trail` API — clickable breadcrumb segments left of the cluster split,
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
      { label: 'week', value: 'MAY 25', accent: 'green' },
      { label: 'files', value: '05', accent: 'green' },
      { label: 'tier', value: 'BOOSTER', accent: 'green' },
    ],
    pill: { text: 'LIVE', ok: true, accent: 'green' },
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
 * Briefing-detail style: trail leaf is the designator with `.md` suffix,
 * tinted with the page's frequency accent (daily = mod, weekly = cyan) so it
 * reads as a doc identifier. Frequency itself moves into a tinted field.
 */
export const WithTrailBriefingDetail: Story = {
  args: {
    prefix: undefined,
    trail: [
      { label: 'Division 2', href: '/division-2' },
      { label: 'Briefings', href: '/division-2/briefings' },
      { label: 'D_2026-05-25.md', accent: 'mod' },
    ],
    fields: [
      { label: 'freq', value: 'DAILY', accent: 'mod' },
      { label: 'period', value: 'MAY 25', accent: 'mod' },
      { label: 'sources', value: '12', accent: 'mod' },
      { label: 'updated', value: 'MAY 25', accent: 'green' },
    ],
    pill: { text: 'PUBLIC', ok: true, accent: 'green' },
  },
}
