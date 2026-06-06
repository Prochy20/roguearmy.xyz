import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StatusPill } from './StatusPill'

const meta = {
  title: 'Components/Me/StatusPill',
  component: StatusPill,
  args: { label: 'ON DUTY', value: 'ACTIVE', tone: 'green', pulse: true },
  argTypes: {
    tone: { control: 'inline-radio', options: ['green', 'magenta', 'cyan'] },
    pulse: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof StatusPill>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders label and value', async () => {
      await expect(canvas.getByText('ON DUTY')).toBeInTheDocument()
      await expect(canvas.getByText('ACTIVE')).toBeInTheDocument()
    })
  },
}

export const Idle: Story = {
  args: { label: 'AFK', value: '12M', tone: 'magenta' },
}

export const Static: Story = {
  args: { pulse: false, value: 'STANDBY' },
}
