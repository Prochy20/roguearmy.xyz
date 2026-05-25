import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BriefingCard } from './BriefingCard'
import { MOCK_BRIEFING_DAILY, MOCK_BRIEFING_WEEKLY } from '../_mock'

const meta = {
  title: 'Components/Division2/Briefings/BriefingCard',
  component: BriefingCard,
  argTypes: {
    tone: { control: 'inline-radio', options: ['standard', 'lead'] },
  },
  args: { briefing: MOCK_BRIEFING_WEEKLY, tone: 'standard' },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BriefingCard>

export default meta
type Story = StoryObj<typeof meta>

export const Weekly: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Weekly card renders the briefing title and ROLL-UP label', async () => {
      await expect(canvas.getByText(args.briefing.title)).toBeInTheDocument()
      // "ROLL-UP" appears in the metadata pill and again in the CTA — assert
      // at least one match instead of a unique one.
      await expect(canvas.getAllByText(/roll-up/i).length).toBeGreaterThan(0)
    })
  },
}

export const Daily: Story = { args: { briefing: MOCK_BRIEFING_DAILY } }

export const Lead: Story = { args: { tone: 'lead' } }
