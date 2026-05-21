import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { GlowButton } from './GlowButton'

const meta = {
  title: 'Components/Shared/GlowButton',
  component: GlowButton,
  argTypes: {
    glowColor: { control: 'inline-radio', options: ['green', 'cyan', 'magenta'] },
    pulse: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Join Now',
    glowColor: 'green',
    pulse: true,
    onClick: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onMouseEnter: fn(),
    onMouseLeave: fn(),
  },
} satisfies Meta<typeof GlowButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await step('Focus reaches the button', async () => {
      await userEvent.tab()
      await expect(args.onFocus).toHaveBeenCalled()
    })

    await step('Click fires onClick once', async () => {
      await userEvent.click(button)
      await expect(args.onClick).toHaveBeenCalledTimes(1)
    })
  },
}

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await step('Button exposes disabled state to assistive tech', async () => {
      await expect(button).toBeDisabled()
    })
  },
}

export const LongLabel: Story = {
  args: { children: 'Open the new content builder' },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await step('Long label renders without truncation', async () => {
      await expect(button).toHaveTextContent('Open the new content builder')
    })

    await step('Click still fires onClick', async () => {
      await userEvent.click(button)
      await expect(args.onClick).toHaveBeenCalledTimes(1)
    })
  },
}

export const Gallery: Story = {
  args: { children: null },
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <GlowButton glowColor="green" pulse>Green · Pulse</GlowButton>
        <GlowButton glowColor="cyan" pulse>Cyan · Pulse</GlowButton>
        <GlowButton glowColor="magenta" pulse>Magenta · Pulse</GlowButton>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <GlowButton glowColor="green" pulse={false}>Green · Static</GlowButton>
        <GlowButton glowColor="cyan" pulse={false}>Cyan · Static</GlowButton>
        <GlowButton glowColor="magenta" pulse={false}>Magenta · Static</GlowButton>
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders all six glow / pulse combinations', async () => {
      const buttons = canvas.getAllByRole('button')
      await expect(buttons).toHaveLength(6)
    })
  },
}
