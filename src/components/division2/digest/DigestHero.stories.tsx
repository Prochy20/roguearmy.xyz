import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestHero } from './DigestHero'

const meta = {
  title: 'Components/Division2/Digest/DigestHero',
  component: DigestHero,
  args: {
    kicker: '// AI · ASHLEY · DIGEST',
    title: 'DIVISION 2',
    accent: 'BRIEFINGS',
    intro: 'Ashley collates every relevant signal each week and condenses it into one packet.',
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DigestHero>

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
