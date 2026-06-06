import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { RaidsPanel, type RaidsScheduleEntry } from './RaidsPanel'

const SCHEDULE: RaidsScheduleEntry[] = [
  {
    day: 'SATURDAY',
    title: 'IRON HORSE',
    imagePrimary: null,
    imageSecondary: null,
  },
  {
    day: 'SUNDAY',
    title: 'DARK HOURS',
    imagePrimary: null,
    imageSecondary: null,
  },
]

const meta = {
  title: 'Components/Division2/Landing/RaidsPanel',
  component: RaidsPanel,
  args: {
    raids: [],
    headlineTitle: 'WEEKLY',
    headlineAccent: 'RAIDS',
    blurb: 'Apollo bot signups in #events — RSVP to lock your slot.',
    rotationLabel: '// REGULAR ROTATION',
    schedule: SCHEDULE,
    discordUrl: 'https://dc.roguearmy.xyz/events',
    ctaLabel: 'OPEN #EVENTS',
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1080 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RaidsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const RotationFallback: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Both raid entries render their day pills', async () => {
      await expect(canvas.getByText('SATURDAY')).toBeInTheDocument()
      await expect(canvas.getByText('SUNDAY')).toBeInTheDocument()
    })
    await step('CTA links to the configured Discord URL', async () => {
      // The panel exposes two #events links: the section-header link
      // (visible "OPEN #EVENTS →") and the CTA button (visible
      // "OPEN #EVENTS" with aria-hidden arrow). Both go to the same URL,
      // so we assert against the full set rather than picking one.
      const links = canvas.getAllByRole('link', { name: /open #events/i })
      await expect(links.length).toBeGreaterThan(0)
      for (const link of links) {
        await expect(link).toHaveAttribute('href', 'https://dc.roguearmy.xyz/events')
      }
    })
  },
}
