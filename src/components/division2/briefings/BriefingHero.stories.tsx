import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BriefingHero } from './BriefingHero'

const meta = {
  title: 'Components/Division2/Briefings/BriefingHero',
  component: BriefingHero,
  args: {
    kicker: '// AI · ASHLEY · BRIEFING',
    title: 'DIVISION 2',
    accent: 'BRIEFINGS',
    intro: 'Ashley collates every relevant signal each week and condenses it into one packet.',
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BriefingHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Kicker and intro render', async () => {
      await expect(canvas.getByText(args.kicker)).toBeInTheDocument()
      await expect(canvas.getByText(args.intro)).toBeInTheDocument()
    })
  },
}
