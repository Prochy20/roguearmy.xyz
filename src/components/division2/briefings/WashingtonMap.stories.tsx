import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { WashingtonMap } from './WashingtonMap'

const meta = {
  title: 'Components/Division2/Briefings/WashingtonMap',
  component: WashingtonMap,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 920,
          height: 920,
          background: '#000',
          position: 'relative',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WashingtonMap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders Division 2 landmark labels in the SVG overlay', async () => {
      await expect(canvas.getByText('BASE OF OPS')).toBeInTheDocument()
      await expect(canvas.getByText('CAPITOL')).toBeInTheDocument()
      await expect(canvas.getByText('PENTAGON')).toBeInTheDocument()
    })
  },
}
