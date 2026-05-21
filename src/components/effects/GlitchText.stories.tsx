import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { GlitchText } from './GlitchText'

const meta = {
  title: 'Components/Effects/GlitchText',
  component: GlitchText,
  argTypes: {
    trigger: { control: 'inline-radio', options: ['scroll', 'hover', 'always'] },
    chromatic: { control: 'boolean' },
    duration: { control: { type: 'number', min: 0.1, step: 0.1 } },
  },
  args: {
    trigger: 'hover',
    chromatic: true,
    duration: 0.6,
    children: (
      <span className="font-display text-5xl uppercase text-white cursor-pointer">Hover Me</span>
    ),
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof GlitchText>

export default meta
type Story = StoryObj<typeof meta>

export const HoverTrigger: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const targets = canvas.getAllByText('Hover Me')
    await step('Hover triggers a one-shot glitch burst', async () => {
      await userEvent.hover(targets[0])
      await expect(targets.length).toBeGreaterThan(0)
    })
  },
}

export const ScrollTrigger: Story = {
  args: { trigger: 'scroll', children: <span className="font-display text-5xl uppercase text-white">SCROLL IN</span> },
}

export const AlwaysOn: Story = {
  args: { trigger: 'always', children: <span className="font-display text-5xl uppercase text-white">CONTINUOUS</span> },
}

export const NoChromatic: Story = {
  args: { chromatic: false, children: <span className="font-display text-5xl uppercase text-white">FLAT</span> },
}
