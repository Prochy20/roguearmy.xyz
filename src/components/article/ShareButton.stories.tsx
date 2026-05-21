import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ShareButton } from './ShareButton'

const meta = {
  title: 'Components/Article/ShareButton',
  component: ShareButton,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  args: { size: 'md' },
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true, navigation: { pathname: '/members/articles/example' } },
  },
} satisfies Meta<typeof ShareButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Initial label is "Copy link"', async () => {
      await expect(canvas.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
    })
    // The "Copied!" flip relies on navigator.clipboard.writeText, which is
    // blocked in headless Chromium without an explicit permission grant.
    // We assert only the initial state here; the full copy flow is covered
    // by the integration tests.
  },
}

export const Small: Story = { args: { size: 'sm' } }
