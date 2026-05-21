import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { OverlayLogo } from './OverlayLogo'

const meta = {
  title: 'Components/Overlays/OverlayLogo',
  component: OverlayLogo,
  argTypes: {
    minInterval: { control: { type: 'number', min: 1 } },
    maxInterval: { control: { type: 'number', min: 1 } },
    minMorphInterval: { control: { type: 'number', min: 1 } },
    maxMorphInterval: { control: { type: 'number', min: 1 } },
  },
  args: {
    minInterval: 4,
    maxInterval: 10,
    minMorphInterval: 15,
    maxMorphInterval: 25,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof OverlayLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Logo image renders with the brand alt text', async () => {
      await expect(canvas.getByAltText(/rogue army logo/i)).toBeInTheDocument()
    })
  },
}

export const FastGlitch: Story = {
  args: { minInterval: 1, maxInterval: 3 },
}
