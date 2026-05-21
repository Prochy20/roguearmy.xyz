import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SeriesHero } from './SeriesHero'

const HERO = {
  url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=2400&q=70',
  alt: 'Glowing arcade lights',
}

const meta = {
  title: 'Components/Members/SeriesHero',
  component: SeriesHero,
  argTypes: {
    articleCount: { control: { type: 'number', min: 0 } },
    completedCount: { control: { type: 'number', min: 0 } },
  },
  args: {
    name: 'OPERATOR ONBOARDING',
    description: 'Five-part field guide for first-week operators. Sigils, handshakes, and the dossier protocol.',
    heroImage: HERO,
    articleCount: 5,
    completedCount: 2,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof SeriesHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Hero exposes the series name and back link', async () => {
      // HeroGlitch duplicates the text into RGB-offset layers — at least one match is enough.
      await expect(canvas.getAllByText(args.name).length).toBeGreaterThan(0)
      await expect(canvas.getByRole('link', { name: /all series/i })).toBeInTheDocument()
    })
  },
}

export const NoHero: Story = {
  args: { heroImage: null },
}

export const NoDescription: Story = {
  args: { description: null },
}

export const NoProgress: Story = {
  args: { completedCount: undefined },
}
