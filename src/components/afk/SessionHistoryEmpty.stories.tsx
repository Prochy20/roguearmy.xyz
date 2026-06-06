import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SessionHistoryEmpty } from './SessionHistoryEmpty'

const meta = {
  title: 'Components/AFK/SessionHistoryEmpty',
  component: SessionHistoryEmpty,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SessionHistoryEmpty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { joinedAt: '2020-03-14T00:00:00.000Z' },
}

export const NoJoinDate: Story = {
  args: { joinedAt: null },
}
