import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'
import { TrelloCard } from './TrelloCard'

const meta = {
  title: 'Components/RichText/TrelloCard',
  component: TrelloCard,
  argTypes: {
    url: { control: 'text' },
    caption: { control: 'text' },
  },
  args: {
    url: 'https://trello.com/c/abc12345/example-card',
    caption: null,
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TrelloCard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The component fetches /api/trello/{shortLink} on mount. In Storybook the
 * endpoint isn't reachable, so the card lands in the error branch — that's
 * the variant we showcase here.
 */
export const FetchFails: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Either loading skeleton or error fallback renders', async () => {
      await canvas.findByText(/loading trello card|unable|failed/i, {}, { timeout: 4000 })
    })
  },
}

export const InvalidUrl: Story = {
  args: { url: 'https://example.com/not-trello' },
}
