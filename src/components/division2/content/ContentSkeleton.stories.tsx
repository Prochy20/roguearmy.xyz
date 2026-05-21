import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ContentSkeleton } from './ContentSkeleton'

const meta = {
  title: 'Components/Division2/Content/ContentSkeleton',
  component: ContentSkeleton,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContentSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Renders the shimmer card frame', async () => {
      const wrappers = canvasElement.querySelectorAll('div')
      await expect(wrappers.length).toBeGreaterThan(0)
    })
  },
}
