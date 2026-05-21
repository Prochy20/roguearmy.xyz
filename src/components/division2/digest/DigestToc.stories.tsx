import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestToc } from './DigestToc'
import { MOCK_DIGEST_SECTIONS } from '../_mock'

const meta = {
  title: 'Components/Division2/Digest/DigestToc',
  component: DigestToc,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: { accent: 'cyan', sections: MOCK_DIGEST_SECTIONS },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestToc>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All sections render as anchor links', async () => {
      for (const section of MOCK_DIGEST_SECTIONS) {
        await expect(canvas.getByText(section.text)).toBeInTheDocument()
      }
    })
  },
}

export const Empty: Story = {
  args: { sections: [] },
}
