import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ReadStatusIndicator, type ReadStatus } from './ReadStatusIndicator'

const ALL_STATUSES: ReadStatus[] = ['unread', 'in_progress', 'completed']

const meta = {
  title: 'Components/Members/ReadStatusIndicator',
  component: ReadStatusIndicator,
  argTypes: {
    status: { control: 'inline-radio', options: ALL_STATUSES },
    progress: { control: { type: 'number', min: 0, max: 100, step: 1 } },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  args: {
    status: 'in_progress',
    progress: 42,
    size: 'md',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ReadStatusIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('In-progress indicator exposes "% read" aria-label', async () => {
      await expect(canvas.getByLabelText(/42% read/i)).toBeInTheDocument()
    })
  },
}

export const Unread: Story = {
  args: { status: 'unread' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Unread exposes the "Unread" label', async () => {
      await expect(canvas.getByLabelText(/unread/i)).toBeInTheDocument()
    })
  },
}

export const Completed: Story = {
  args: { status: 'completed' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Completed exposes "Completed" label', async () => {
      await expect(canvas.getByLabelText(/completed/i)).toBeInTheDocument()
    })
  },
}

export const AllStatuses: Story = {
  args: { status: 'unread' },
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <ReadStatusIndicator status="unread" />
      <ReadStatusIndicator status="in_progress" progress={20} />
      <ReadStatusIndicator status="in_progress" progress={75} />
      <ReadStatusIndicator status="completed" />
    </div>
  ),
}
