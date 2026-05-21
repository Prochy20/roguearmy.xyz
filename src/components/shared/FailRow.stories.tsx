import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { FailRow } from './FailRow'

const ALL_CODES = ['unauthenticated', 'unauthorized', 'unavailable', 'unknown'] as const

const meta = {
  title: 'Components/Shared/FailRow',
  component: FailRow,
  argTypes: {
    code: { control: 'select', options: ALL_CODES },
    status: { control: { type: 'number' } },
    returnTo: { control: 'text' },
  },
  args: {
    code: 'unauthenticated',
    returnTo: '/me',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FailRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders ASHLEY SESSION NOT ESTABLISHED + RE-LOGIN link', async () => {
      await expect(canvas.getByText(/ashley session not established/i)).toBeInTheDocument()
      await expect(canvas.getByRole('link', { name: /re-login/i })).toBeInTheDocument()
    })
  },
}

export const Unauthorized: Story = { args: { code: 'unauthorized' } }
export const Unavailable: Story = { args: { code: 'unavailable', status: 503 } }
export const Unknown: Story = { args: { code: 'unknown', status: 500 } }
