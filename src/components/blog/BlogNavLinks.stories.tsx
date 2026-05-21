import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BlogNavLinks } from './BlogNavLinks'

const meta = {
  title: 'Components/Blog/BlogNavLinks',
  component: BlogNavLinks,
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true, navigation: { pathname: '/blog' } },
  },
} satisfies Meta<typeof BlogNavLinks>

export default meta
type Story = StoryObj<typeof meta>

export const ArticlesActive: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Both nav links render', async () => {
      await expect(canvas.getByRole('link', { name: /articles/i })).toBeInTheDocument()
      await expect(canvas.getByRole('link', { name: /series/i })).toBeInTheDocument()
    })
  },
}

export const SeriesActive: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/blog/series' } },
  },
}
