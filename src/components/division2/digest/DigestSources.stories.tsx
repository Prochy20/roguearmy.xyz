import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestSources } from './DigestSources'
import { MOCK_DIGEST_ARTICLES } from '../_mock'

const meta = {
  title: 'Components/Division2/Digest/DigestSources',
  component: DigestSources,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: { accent: 'cyan', articles: MOCK_DIGEST_ARTICLES },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestSources>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Each source article title renders', async () => {
      for (const article of MOCK_DIGEST_ARTICLES) {
        await expect(canvas.getByText(article.title)).toBeInTheDocument()
      }
    })
  },
}
