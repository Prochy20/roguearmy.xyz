import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SetStatusForm } from './SetStatusForm'

const meta = {
  title: 'Components/AFK/SetStatusForm',
  component: SetStatusForm,
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof SetStatusForm>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = {
  args: { currentStatus: 'active', currentReason: null },
}

export const Afk: Story = {
  args: { currentStatus: 'afk', currentReason: 'sleeping' },
}

export const AfkNoReason: Story = {
  args: { currentStatus: 'afk', currentReason: null },
}
