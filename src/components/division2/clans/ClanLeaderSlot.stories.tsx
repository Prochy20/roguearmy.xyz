import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ClanLeaderSlot } from './ClanLeaderSlot'
import {
  MOCK_LEADER_GREEN,
  MOCK_LEADER_AMBER,
  MOCK_LEADER_AZURE,
} from './_mock'

const meta = {
  title: 'Components/Division2/Clans/ClanLeaderSlot',
  component: ClanLeaderSlot,
  args: {
    leader: MOCK_LEADER_GREEN,
    accent: 'green',
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClanLeaderSlot>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Display name + DISCORD · OPERATIVE caption render', async () => {
      await expect(canvas.getByText('MAVERICK')).toBeInTheDocument()
      await expect(canvas.getByText(/DISCORD · OPERATIVE/i)).toBeInTheDocument()
    })
    await step('Initials fallback fires when avatarUrl is null', async () => {
      // initialsOf("MAVERICK") → "MA" (single-word path → first 2 chars).
      await expect(canvas.getByText('MA')).toBeInTheDocument()
    })
  },
}

export const LongDisplayName: Story = {
  args: {
    leader: {
      ...MOCK_LEADER_GREEN,
      displayName: 'EXTREMELY-LONG-DISCORD-DISPLAY-NAME',
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Long display names stay inside the slot via the truncate class', async () => {
      const name = canvas.getByText('EXTREMELY-LONG-DISCORD-DISPLAY-NAME')
      await expect(name.className).toMatch(/truncate/)
    })
  },
}

export const Gallery: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {(
        [
          { leader: MOCK_LEADER_GREEN, accent: 'green' as const },
          { leader: MOCK_LEADER_AMBER, accent: 'amber' as const },
          { leader: MOCK_LEADER_AZURE, accent: 'azure' as const },
        ]
      ).map(({ leader, accent }) => (
        <ClanLeaderSlot key={leader.discordId} leader={leader} accent={accent} />
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All three accent variants render their leader names', async () => {
      await expect(canvas.getByText('MAVERICK')).toBeInTheDocument()
      await expect(canvas.getByText('PHOENIX')).toBeInTheDocument()
      await expect(canvas.getByText('CIPHER')).toBeInTheDocument()
    })
  },
}
