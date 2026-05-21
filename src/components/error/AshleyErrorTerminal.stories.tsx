import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { AshleyErrorTerminal } from './AshleyErrorTerminal'
import { getErrorConfig } from './error-config'

const meta = {
  title: 'Components/Error/AshleyErrorTerminal',
  component: AshleyErrorTerminal,
  argTypes: {
    startDelay: { control: { type: 'number', min: 0, step: 100 } },
  },
  args: {
    config: getErrorConfig('404'),
    startDelay: 200,
    requestedPath: '/forbidden/sector',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AshleyErrorTerminal>

export default meta
type Story = StoryObj<typeof meta>

export const NotFound: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Terminal header brands the channel', async () => {
      await expect(canvas.getByText(/ashley@roguearmy/i)).toBeInTheDocument()
    })
  },
}

export const Banned: Story = {
  args: { config: getErrorConfig('BAN'), requestedPath: null },
}

export const ServerCrash: Story = {
  args: { config: getErrorConfig('500'), requestedPath: null },
}
