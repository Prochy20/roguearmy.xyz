import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ArticleTeaserView } from './ArticleTeaserView'
import { MOCK_ARTICLE_MAGENTA } from '@/components/members/_mock'

const meta = {
  title: 'Components/Blog/ArticleTeaserView',
  component: ArticleTeaserView,
  args: { article: MOCK_ARTICLE_MAGENTA },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/blog/security/shadow-protocol' } },
  },
} satisfies Meta<typeof ArticleTeaserView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('CLASSIFIED INTEL gate renders', async () => {
      await expect(canvas.getByText(/classified intel/i)).toBeInTheDocument()
      await expect(canvas.getByRole('button', { name: /authenticate/i })).toBeInTheDocument()
    })
  },
}
