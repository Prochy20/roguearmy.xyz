import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { TopoBackground } from './TopoBackground'

const meta = {
  title: 'Components/Shared/Header/TopoBackground',
  component: TopoBackground,
  argTypes: {
    accent: { control: 'inline-radio', options: ['green', 'cyan'] },
    glow: { control: { type: 'number', min: 0, max: 2, step: 0.1 } },
  },
  args: {
    accent: 'cyan',
    glow: 1,
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '24rem', background: '#030303' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopoBackground>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Decorative SVG topographic pattern is rendered', async () => {
      const svg = canvasElement.querySelector('svg')
      await expect(svg).not.toBeNull()
    })
  },
}

export const GreenAccent: Story = { args: { accent: 'green' } }
export const HighGlow: Story = { args: { glow: 1.8 } }
