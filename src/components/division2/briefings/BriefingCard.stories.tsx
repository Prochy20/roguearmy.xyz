import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BriefingCard } from './BriefingCard'
import { MOCK_BRIEFING_DAILY, MOCK_BRIEFING_WEEKLY } from '../_mock'

const meta = {
  title: 'Components/Division2/Briefings/BriefingCard',
  component: BriefingCard,
  argTypes: {
    tone: { control: 'inline-radio', options: ['standard', 'lead'] },
  },
  args: { briefing: MOCK_BRIEFING_WEEKLY, tone: 'standard' },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BriefingCard>

export default meta
type Story = StoryObj<typeof meta>

export const Weekly: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Weekly card renders the briefing title and ROLL-UP label', async () => {
      await expect(canvas.getByText(args.briefing.title)).toBeInTheDocument()
      // "ROLL-UP" appears in the metadata pill and again in the CTA — assert
      // at least one match instead of a unique one.
      await expect(canvas.getAllByText(/roll-up/i).length).toBeGreaterThan(0)
    })
  },
}

export const Daily: Story = { args: { briefing: MOCK_BRIEFING_DAILY } }

export const Lead: Story = { args: { tone: 'lead' } }

/**
 * Thumbnail URL is null OR the remote image failed to load. The card swaps
 * the &lt;img&gt; for a tactical NO_SIGNAL placeholder so the grid never shows
 * a broken-image glyph. Use the `briefing` control to flip frequency
 * (weekly/cyan vs daily/mod) — placeholder picks up the accent automatically.
 */
export const NoSignal: Story = {
  args: { briefing: { ...MOCK_BRIEFING_DAILY, thumbnailUrl: null } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Placeholder shows the NO SIGNAL marker and feed-offline telemetry', async () => {
      await expect(canvas.getByText('NO SIGNAL')).toBeInTheDocument()
      await expect(canvas.getByText('OFFLINE')).toBeInTheDocument()
    })
  },
}

/**
 * Member has started but not finished the briefing. The BRF doc-id chip at
 * the tail of the telemetry row swaps for `READ 62%` — `READ` muted, `62%`
 * in the card's frequency accent (cyan for weekly). Swap (rather than
 * append) keeps the row at a constant 4 items so it never wraps in the
 * narrow 4-col grid.
 */
export const WithPartialProgress: Story = {
  args: { progress: { progress: 62, completed: false } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Telemetry tail shows READ 62% in place of BRF doc-id', async () => {
      await expect(canvas.getByText('62%')).toBeInTheDocument()
    })
  },
}

/**
 * Member crossed the 85% completion threshold. Tail chip becomes `READ ✓`
 * with the checkmark in `text-rga-green` — a milestone earned a dedicated
 * color. BRF doc-id is hidden on completed cards since state reads as more
 * useful than flavor.
 */
export const WithCompletedProgress: Story = {
  args: { progress: { progress: 100, completed: true } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Telemetry tail shows the completion checkmark', async () => {
      await expect(canvas.getByLabelText('Read')).toBeInTheDocument()
    })
  },
}

/**
 * Lead variant with progress — corner marker stays as `◊ LATEST` regardless
 * of state (lead is loud enough already); progress surfaces only in the
 * bottom telemetry row's tail slot, the same way standard tiles handle it.
 * Flip `progress.completed` via Controls to see the green ✓ swap.
 */
export const LeadWithProgress: Story = {
  args: { tone: 'lead', progress: { progress: 45, completed: false } },
}
