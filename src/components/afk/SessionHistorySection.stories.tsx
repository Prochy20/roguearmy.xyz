import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SessionHistorySection } from './SessionHistorySection'
import { mockClosedSessions } from './_mock'

const meta = {
  title: 'Components/AFK/SessionHistorySection',
  component: SessionHistorySection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SessionHistorySection>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {
  args: {
    initialItems: mockClosedSessions,
    initialTotal: mockClosedSessions.length,
    initialOffset: 0,
    joinedAt: '2020-03-14T00:00:00.000Z',
    currentlyAfk: false,
  },
}

export const WithLoadMore: Story = {
  args: {
    initialItems: mockClosedSessions,
    initialTotal: 47,
    initialOffset: 0,
    joinedAt: '2020-03-14T00:00:00.000Z',
    currentlyAfk: false,
  },
}

export const Empty: Story = {
  args: {
    initialItems: [],
    initialTotal: 0,
    initialOffset: 0,
    joinedAt: '2020-03-14T00:00:00.000Z',
    currentlyAfk: false,
  },
}

export const WhileAfk: Story = {
  args: {
    initialItems: mockClosedSessions,
    initialTotal: mockClosedSessions.length + 1,
    initialOffset: 0,
    joinedAt: '2020-03-14T00:00:00.000Z',
    currentlyAfk: true,
  },
}
