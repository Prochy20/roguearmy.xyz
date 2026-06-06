import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SessionHistoryTable } from './SessionHistoryTable'
import { mockClosedSessions } from './_mock'

const meta = {
  title: 'Components/AFK/SessionHistoryTable',
  component: SessionHistoryTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SessionHistoryTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { items: mockClosedSessions },
}

export const SingleRow: Story = {
  args: { items: [mockClosedSessions[0]] },
}

export const LongReason: Story = {
  args: {
    items: [
      {
        ...mockClosedSessions[0],
        reason:
          'on a 12-hour shift driving an excavator across the field, will not be back until late evening at the earliest',
      },
    ],
  },
}

export const NoReason: Story = {
  args: { items: [{ ...mockClosedSessions[0], reason: null }] },
}
