import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { BracketButton } from './BracketButton'

const meta = {
  title: 'Components/Shared/Header/BracketButton',
  component: BracketButton,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'green', 'white'] },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    accent: 'cyan',
    active: false,
    children: 'Menu',
    onClick: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BracketButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await step('Click fires onClick once', async () => {
      await userEvent.click(button)
      await expect(args.onClick).toHaveBeenCalledTimes(1)
    })
  },
}

export const Active: Story = { args: { active: true, children: 'Active' } }

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Button exposes disabled state', async () => {
      await expect(canvas.getByRole('button')).toBeDisabled()
    })
  },
}

export const Accents: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <BracketButton accent="cyan">Cyan</BracketButton>
      <BracketButton accent="green">Green</BracketButton>
      <BracketButton accent="white">White</BracketButton>
    </div>
  ),
}
