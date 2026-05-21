import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DEFAULT_CONFIG } from '@/lib/overlay-box-config'
import { OverlayBox } from './OverlayBox'

const meta = {
  title: 'Components/Overlays/OverlayBox',
  component: OverlayBox,
  args: { ...DEFAULT_CONFIG, text: '// FORMATION HUD ARMED' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OverlayBox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const body = within(document.body)
    await step('Configured text appears inside the bordered box', async () => {
      await expect(body.getByText('// FORMATION HUD ARMED')).toBeInTheDocument()
    })
  },
}

export const Magenta: Story = {
  args: { color: 'magenta', text: '// BREACH DETECTED' },
}

export const NoAccent: Story = { args: { accent: false } }
