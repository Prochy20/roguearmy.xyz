import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SocialEmbed } from './SocialEmbed'

const meta = {
  title: 'Components/Content/RichText/SocialEmbed',
  component: SocialEmbed,
  argTypes: {
    url: { control: 'text' },
    caption: { control: 'text' },
  },
  args: {
    url: 'https://twitter.com/anthropic/status/1730000000000000000',
    caption: 'Anthropic on Claude 4.7',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SocialEmbed>

export default meta
type Story = StoryObj<typeof meta>

export const Twitter: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Platform badge renders the Tweet content-type label', async () => {
      // After the X rebrand the platform label is just "X" — the more
      // descriptive content-type label "Tweet" is what's stable enough
      // to assert against.
      await canvas.findByText(/tweet/i, {}, { timeout: 2000 })
    })
  },
}

export const Instagram: Story = {
  args: { url: 'https://www.instagram.com/p/Cabc123/', caption: 'Instagram post' },
}

export const InvalidUrl: Story = {
  args: { url: 'not-a-real-social-url', caption: null },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Surfaces the invalid-URL fallback message', async () => {
      await expect(canvas.getByText(/unable to load social embed/i)).toBeInTheDocument()
    })
  },
}
