import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { BookmarksProvider } from '@/contexts/BookmarksContext'
import { BookmarkButton } from './BookmarkButton'

const meta = {
  title: 'Components/Article/BookmarkButton',
  component: BookmarkButton,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  args: {
    articleId: 'art_001',
    size: 'md',
  },
  parameters: { layout: 'centered' },
  decorators: [
    /**
     * BookmarkButton bails out (returns null) when used outside BookmarksProvider.
     * The provider attempts a /api/member/bookmarks fetch on mount — in Storybook
     * that just fails silently and the component lands in the "not bookmarked"
     * state, which is the variant we want to showcase.
     */
    (Story) => (
      <BookmarksProvider>
        <Story />
      </BookmarksProvider>
    ),
  ],
} satisfies Meta<typeof BookmarkButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders as a button with the "Add bookmark" aria-label', async () => {
      await expect(canvas.getByRole('button', { name: /add bookmark/i })).toBeInTheDocument()
    })
    await step('Clicking triggers the toggle (animation runs even if API fails)', async () => {
      await userEvent.click(canvas.getByRole('button'))
    })
  },
}

export const Small: Story = { args: { size: 'sm' } }
