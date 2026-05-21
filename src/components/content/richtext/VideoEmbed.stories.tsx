import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { VideoEmbed } from './VideoEmbed'

const meta = {
  title: 'Components/Content/RichText/VideoEmbed',
  component: VideoEmbed,
  argTypes: {
    url: { control: 'text' },
    title: { control: 'text' },
  },
  args: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Sample video',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VideoEmbed>

export default meta
type Story = StoryObj<typeof meta>

export const YouTube: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Platform badge reads YouTube', async () => {
      await expect(canvas.getByText(/youtube/i)).toBeInTheDocument()
    })
  },
}

export const Vimeo: Story = {
  args: { url: 'https://vimeo.com/76979871', title: 'The Mountain' },
}

export const InvalidUrl: Story = {
  args: { url: 'not-a-video', title: null },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Invalid URL surfaces fallback message', async () => {
      await expect(canvas.getByText(/unable to load video/i)).toBeInTheDocument()
    })
  },
}
