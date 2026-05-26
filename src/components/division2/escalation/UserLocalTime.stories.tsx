import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'
import { UserLocalTime } from './UserLocalTime'

// Fixed reference instant: 09:00 UTC = 11:00 CEST on a summer day.
const REFERENCE_UTC = '2026-05-26T09:00:00.000Z'
// Sentinel fallback that `Intl.DateTimeFormat` can never produce — lets the
// play-test prove the swap fired regardless of the runner's local timezone.
const SENTINEL_FALLBACK = 'AWAITING SWAP'

const meta = {
  title: 'Components/Division2/Escalation/UserLocalTime',
  component: UserLocalTime,
  args: {
    utcIso: REFERENCE_UTC,
    fallback: SENTINEL_FALLBACK,
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          fontFamily:
            'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
          fontSize: 14,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#00FF41',
        }}
      >
        // EXPECTED ≈ <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserLocalTime>

export default meta
type Story = StoryObj<typeof meta>

/**
 * SSR fallback renders first; a post-mount effect swaps in the visitor's
 * resolved timezone (e.g. `09:00 GMT` for UTC viewers, `05:00 EDT` for NYC).
 * The swap is intentional — it sidesteps a hydration mismatch that would
 * happen if we tried to detect TZ during SSR.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    // Compute the expected post-mount string the same way the component
    // does — so the assertion stays correct under any runner timezone.
    const expected = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    })
      .format(new Date(REFERENCE_UTC))
      .toUpperCase()

    await step('Post-mount swap replaces the fallback with the localized time', async () => {
      await waitFor(async () => {
        await expect(canvas.getByText(expected)).toBeInTheDocument()
      })
      // Sentinel fallback must be gone — proves the swap actually fired,
      // not just that some text happens to match a date-like regex.
      await expect(canvas.queryByText(SENTINEL_FALLBACK)).toBeNull()
    })
  },
}
