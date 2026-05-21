import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { EscalationDiscordRow } from './EscalationDiscordRow'

const ENABLED_CONTENT = {
  enabled: true,
  sectionLabel: '// DISCORD COMMS · DAILY DROPS',
  heading: 'ALSO POSTED ON DISCORD',
  body: 'Ashley relays each daily rotation to #division-2-escalation 60 seconds after upstream publishes.',
  channelLabel: '#division-2-escalation',
  channelUrl: 'https://dc.roguearmy.xyz/division2',
  ctaLabel: 'OPEN CHANNEL',
}

const meta = {
  title: 'Components/Division2/Escalation/EscalationDiscordRow',
  component: EscalationDiscordRow,
  args: { content: ENABLED_CONTENT },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EscalationDiscordRow>

export default meta
type Story = StoryObj<typeof meta>

export const Enabled: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('CTA links to the configured channel URL in a new tab', async () => {
      const link = canvas.getByRole('link', { name: /open channel/i })
      await expect(link).toHaveAttribute('href', ENABLED_CONTENT.channelUrl)
      await expect(link).toHaveAttribute('target', '_blank')
    })
  },
}

export const Disabled: Story = {
  args: { content: { ...ENABLED_CONTENT, enabled: false } },
  play: async ({ canvasElement, step }) => {
    await step('Component returns null when disabled — no chrome rendered', async () => {
      await expect(canvasElement.children.length).toBe(0)
    })
  },
}
