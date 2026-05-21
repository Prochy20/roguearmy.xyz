import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { DiscordIcon } from './DiscordIcon'

const meta = {
  title: 'Components/UI/DiscordIcon',
  component: DiscordIcon,
  argTypes: {
    className: { control: 'text' },
  },
  args: {
    className: 'w-12 h-12 text-rga-cyan',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DiscordIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('SVG mark is in the DOM and aria-hidden', async () => {
      const svg = canvasElement.querySelector('svg')
      await expect(svg).not.toBeNull()
      await expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  },
}

export const Sizes: Story = {
  args: { className: '' },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#00FFFF' }}>
      <DiscordIcon className="w-4 h-4" />
      <DiscordIcon className="w-8 h-8" />
      <DiscordIcon className="w-16 h-16" />
    </div>
  ),
}

export const Colors: Story = {
  args: { className: '' },
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <DiscordIcon className="w-10 h-10 text-rga-green" />
      <DiscordIcon className="w-10 h-10 text-rga-cyan" />
      <DiscordIcon className="w-10 h-10 text-rga-magenta" />
    </div>
  ),
}
