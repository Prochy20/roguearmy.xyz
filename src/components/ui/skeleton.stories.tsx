import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { Skeleton } from './skeleton'

const meta = {
  title: 'Components/UI/Skeleton',
  component: Skeleton,
  argTypes: {
    glow: { control: 'boolean' },
  },
  args: {
    className: 'h-6 w-48',
    glow: false,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Skeleton placeholder div mounts', async () => {
      await expect(canvasElement.firstElementChild).toBeTruthy()
    })
  },
}

export const Glow: Story = {
  args: { glow: true },
}

export const CardLoader: Story = {
  args: { className: '' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '20rem' }}>
      <Skeleton className="h-6 w-3/4" glow />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ),
}

export const AvatarRow: Story = {
  args: { className: '' },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),
}
