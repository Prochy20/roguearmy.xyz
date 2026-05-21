import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import type { Game } from '@/payload-types'
import { GamesShowcase } from './GamesShowcase'

const NOW = '2026-05-21T08:00:00.000Z'

const GAMES: Game[] = [
  {
    id: 'g_div2',
    name: 'The Division 2',
    subtitle: 'Tactical PvE / PvP',
    description: 'Raids, dark zone, escalation. Our flagship lobby.',
    color: 'orange',
    featured: true,
    updatedAt: NOW,
    createdAt: NOW,
  },
  {
    id: 'g_sot',
    name: 'Sea of Thieves',
    subtitle: 'Pirate co-op',
    description: 'Tall tales, hoarders, and the occasional kraken.',
    color: 'teal',
    updatedAt: NOW,
    createdAt: NOW,
  },
  {
    id: 'g_helldivers',
    name: 'Helldivers 2',
    subtitle: 'Democracy enforcement',
    description: 'Strategems, bug fronts, and managed friendly fire.',
    color: 'yellow',
    updatedAt: NOW,
    createdAt: NOW,
  },
]

const meta = {
  title: 'Components/Home/GamesShowcase',
  component: GamesShowcase,
  args: { games: GAMES },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GamesShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Each configured game renders its name strip', async () => {
      for (const game of GAMES) {
        await expect(canvas.getByText(game.name.toUpperCase())).toBeInTheDocument()
      }
    })
  },
}

export const Empty: Story = {
  args: { games: [] },
}
