import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StaffRosterBanner } from './StaffRosterBanner'

const MOCK_CONTENT = {
  enabled: true,
  kicker: '// ROSTER FRAGMENT',
  title: 'OFF THE MANIFEST',
  body: 'Some channels are run by operatives who declined the staff manifest. Their handles stay redacted.',
  ctaLabel: 'OPEN #STAFF-ROOM',
  ctaHref: 'https://dc.roguearmy.xyz/staff-room',
  fragment: {
    label: 'cat manifest.fragments.log',
    entries: [
      { id: '1', label: 'EVENTS · STREAMS', tone: 'cyan' as const, note: 'ROTATING' },
      { id: '2', label: 'ESCALATION · COMMS', tone: 'green' as const, note: 'ACTIVE' },
    ],
    redactedLine: '// MORE NAMES REDACTED · ASK IN #STAFF',
  },
}

const meta = {
  title: 'Components/Community/Staff/StaffRosterBanner',
  component: StaffRosterBanner,
  args: { content: MOCK_CONTENT },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof StaffRosterBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Banner renders the title from the content payload', async () => {
      await expect(canvas.getByText(/off the manifest/i)).toBeInTheDocument()
    })
  },
}

export const NullContent: Story = {
  args: { content: null },
  play: async ({ canvasElement, step }) => {
    await step('Banner renders nothing when content is null', async () => {
      await expect(canvasElement.firstElementChild?.children.length ?? 0).toBe(0)
    })
  },
}
