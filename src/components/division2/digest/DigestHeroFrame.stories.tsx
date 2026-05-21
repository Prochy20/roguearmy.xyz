import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestHeroFrame } from './DigestHeroFrame'

const meta = {
  title: 'Components/Division2/Digest/DigestHeroFrame',
  component: DigestHeroFrame,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
    frequency: { control: 'inline-radio', options: ['weekly', 'daily'] },
  },
  args: {
    accent: 'cyan',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=2400&q=70',
    frequency: 'weekly',
    periodLabel: 'WEEK OF MAY 19',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestHeroFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Documentary plate + bottom metadata row render', async () => {
      await expect(canvas.getByText(/specimen/i)).toBeInTheDocument()
      await expect(canvas.getByText(new RegExp(args.periodLabel, 'i'))).toBeInTheDocument()
    })
  },
}

export const Daily: Story = {
  args: { accent: 'mod', frequency: 'daily', periodLabel: 'MAY 21 · TUE' },
}
