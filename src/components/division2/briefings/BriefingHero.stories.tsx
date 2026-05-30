import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BriefingHero } from './BriefingHero'

const meta = {
  title: 'Components/Division2/Briefings/BriefingHero',
  component: BriefingHero,
  args: {
    title: 'WASHINGTON',
    accent: 'BRIEFINGS',
    intro: 'Ashley collates every relevant signal each week and condenses it into one packet.',
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BriefingHero>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The briefings list page render — no kicker. Location moved to the
 * StatRibbon trail; this hero is pure title + intro.
 */
export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Title and intro render without a kicker', async () => {
      await expect(canvas.getByText(args.title)).toBeInTheDocument()
      await expect(canvas.getByText(args.intro)).toBeInTheDocument()
    })
  },
}

/**
 * Sibling-page variant: kicker survives as a small muted flavor line — the
 * recipe sibling pages (Content "LIVE INTEL", Escalation "TARGETED LOOT") will
 * use in phase 2. Visually demoted vs. the old orange kicker so it can't
 * outweigh the StatRibbon breadcrumbs above.
 */
export const WithFlavorKicker: Story = {
  args: {
    kicker: '// LIVE INTEL',
    title: 'CONTENT',
    accent: 'FEED',
    intro: 'Aggregated signal from the Division 2 ecosystem, ranked and tagged by Ashley.',
  },
}
