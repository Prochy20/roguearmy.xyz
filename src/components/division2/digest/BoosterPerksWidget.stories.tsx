import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BoosterPerksWidget } from './BoosterPerksWidget'

const PERKS = {
  enabled: true,
  kicker: '// COMMUNITY-FUNDED',
  heading: 'BOOST THE SERVER · UNLOCK DAILY BRIEFINGS',
  body: 'Server boosts fund Discord features the whole community uses. As a thank-you, boosters get the daily briefing.',
  fundBullets: [
    { text: 'Higher upload limits for the whole community' },
    { text: 'Custom emojis, stickers, and channel badges' },
  ],
  bullets: [
    { text: 'Daily briefing access' },
    { text: 'Booster-only badge on dossiers' },
  ],
  cta: { label: 'BOOST · DISCORD', url: 'https://dc.roguearmy.xyz/boost' },
}

const meta = {
  title: 'Components/Division2/Digest/BoosterPerksWidget',
  component: BoosterPerksWidget,
  args: { perks: PERKS },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BoosterPerksWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Enabled: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Headline and CTA render', async () => {
      await expect(canvas.getByText(/boost the server/i)).toBeInTheDocument()
      await expect(canvas.getByRole('link', { name: /boost · discord/i })).toBeInTheDocument()
    })
  },
}

export const Disabled: Story = {
  args: { perks: { ...PERKS, enabled: false } },
  play: async ({ canvasElement, step }) => {
    await step('Component returns null when disabled', async () => {
      // canvasElement > globalFontDecorator > localMaxWidthDecorator > (null).
      // Drill two levels to assert the innermost wrapper has zero children.
      await expect(
        canvasElement.firstElementChild?.firstElementChild?.children.length ?? -1,
      ).toBe(0)
    })
  },
}
