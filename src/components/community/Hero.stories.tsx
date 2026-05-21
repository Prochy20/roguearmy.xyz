import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Hero } from './Hero'
import { STATS_FAIL_UNAVAILABLE, STATS_OK } from './_mock'

const meta = {
  title: 'Components/Community/Hero',
  component: Hero,
  args: { stats: STATS_OK },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/community' } },
  },
} satisfies Meta<typeof Hero>

export default meta
type Story = StoryObj<typeof meta>

export const Live: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Headline + member count render, status pill says LIVE', async () => {
      await expect(canvas.getAllByText(/operatives/i).length).toBeGreaterThan(0)
      await expect(canvas.getAllByText('12,480').length).toBeGreaterThan(0)
      await expect(canvas.getByText('LIVE')).toBeInTheDocument()
    })
  },
}

export const StatsOffline: Story = {
  args: { stats: STATS_FAIL_UNAVAILABLE },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Fallback ∞ count + OFFLINE pill render', async () => {
      await expect(canvas.getAllByText('∞').length).toBeGreaterThan(0)
      await expect(canvas.getByText('OFFLINE')).toBeInTheDocument()
    })
  },
}
