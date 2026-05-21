import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { FailNote } from './FailNote'
import {
  ERR_FORBIDDEN,
  ERR_INVALID,
  ERR_NOT_FOUND,
  ERR_UNAVAILABLE,
  ERR_UNKNOWN,
} from './_mock'

const meta = {
  title: 'Components/Community/FailNote',
  component: FailNote,
  args: {
    error: ERR_UNAVAILABLE,
    resource: 'STATS',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FailNote>

export default meta
type Story = StoryObj<typeof meta>

export const Unavailable: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Message matches the unavailable code path', async () => {
      await expect(canvas.getByText(/upstream unreachable/i)).toBeInTheDocument()
    })
  },
}

export const NotFound: Story = { args: { error: ERR_NOT_FOUND, resource: 'CHANNEL' } }
export const Forbidden: Story = { args: { error: ERR_FORBIDDEN, resource: 'STAFF' } }
export const Invalid: Story = { args: { error: ERR_INVALID, resource: 'INPUT' } }
export const Unknown: Story = { args: { error: ERR_UNKNOWN, resource: 'STATS' } }
