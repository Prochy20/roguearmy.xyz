import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'Components/Article/EmptyState',
  component: EmptyState,
  argTypes: {
    message: { control: 'text' },
  },
  args: {
    onClearFilters: fn(),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Glitchy NO SIGNAL headline renders', async () => {
      await expect(canvas.getAllByText('NO SIGNAL').length).toBeGreaterThan(0)
    })
    await step('Clicking the CTA fires onClearFilters', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /clear all filters/i }))
      await expect(args.onClearFilters).toHaveBeenCalledTimes(1)
    })
  },
}

export const CustomMessage: Story = {
  args: {
    message: 'No dossiers match the active cipher. Reset filters to re-establish signal.',
  },
}
