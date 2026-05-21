import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestRefs } from './DigestRefs'
import { MOCK_DIGEST_ARTICLES } from '../_mock'

const meta = {
  title: 'Components/Division2/Digest/DigestRefs',
  component: DigestRefs,
  args: { articles: MOCK_DIGEST_ARTICLES },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestRefs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders each ref with a [NN] ordinal', async () => {
      await expect(canvas.getByText('[01]')).toBeInTheDocument()
      await expect(canvas.getByText('[02]')).toBeInTheDocument()
      await expect(canvas.getByText('[03]')).toBeInTheDocument()
    })
  },
}

export const Empty: Story = { args: { articles: [] } }
