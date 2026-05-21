import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestTldrCard } from './DigestTldrCard'
import { MOCK_DIGEST_WEEKLY } from '../_mock'

const meta = {
  title: 'Components/Division2/Digest/DigestTldrCard',
  component: DigestTldrCard,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: { accent: 'cyan', highlights: MOCK_DIGEST_WEEKLY.highlights },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestTldrCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders the takeaways count chip', async () => {
      await expect(canvas.getByText(new RegExp(`x0${args.highlights.length} items`, 'i'))).toBeInTheDocument()
    })
  },
}

export const Empty: Story = {
  args: { highlights: [] },
  play: async ({ canvasElement, step }) => {
    await step('Returns null when no highlights are supplied', async () => {
      await expect(canvasElement.firstElementChild?.children.length ?? -1).toBe(0)
    })
  },
}
