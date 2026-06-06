import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { HeroGlitch } from './HeroGlitch'

const meta = {
  title: 'Components/Effects/HeroGlitch',
  component: HeroGlitch,
  argTypes: {
    minInterval: { control: { type: 'number', min: 1, step: 0.5 } },
    maxInterval: { control: { type: 'number', min: 1, step: 0.5 } },
    intensity: { control: { type: 'number', min: 1, max: 10 } },
    dataCorruption: { control: 'boolean' },
    scanlines: { control: 'boolean' },
  },
  args: {
    minInterval: 3,
    maxInterval: 8,
    intensity: 7,
    dataCorruption: true,
    scanlines: true,
    children: (
      <h1 className="font-display text-7xl uppercase text-white">
        ROGUE <span className="text-rga-green text-glow-green">ARMY</span>
      </h1>
    ),
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof HeroGlitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Hero text renders inside the glitch wrapper', async () => {
      await expect(canvas.getAllByText(/rogue/i).length).toBeGreaterThan(0)
    })
  },
}

export const HighIntensity: Story = { args: { intensity: 10 } }
export const LowIntensity: Story = { args: { intensity: 3 } }
export const NoScanlines: Story = { args: { scanlines: false } }
export const NoCorruption: Story = { args: { dataCorruption: false } }

export const CyanMagenta: Story = {
  args: { colors: ['#00ffff', '#ff00ff'] },
}

export const GreenCyan: Story = {
  args: { colors: ['#00ff41', '#00ffff'] },
}
