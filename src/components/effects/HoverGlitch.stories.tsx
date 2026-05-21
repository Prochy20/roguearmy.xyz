import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { HoverGlitch } from './HoverGlitch'

const meta = {
  title: 'Components/Effects/HoverGlitch',
  component: HoverGlitch,
  argTypes: {
    intensity: { control: { type: 'number', min: 1, max: 10 } },
    dataCorruption: { control: 'boolean' },
  },
  args: {
    intensity: 6,
    dataCorruption: true,
    children: <span className="font-display text-5xl uppercase text-white cursor-pointer">Hover Me</span>,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof HoverGlitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const target = canvas.getByText('Hover Me')
    await step('Hover triggers data-corruption glitch', async () => {
      await userEvent.hover(target)
      await expect(target).toBeInTheDocument()
    })
  },
}

export const HighIntensity: Story = { args: { intensity: 10 } }
export const NoCorruption: Story = { args: { dataCorruption: false } }
export const GreenMagenta: Story = { args: { colors: ['#00ff41', '#ff00ff'] } }
