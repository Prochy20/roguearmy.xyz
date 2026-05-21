import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DEFAULT_CONFIG } from '@/lib/overlay-hero-config'
import { OverlayHero } from './OverlayHero'

const meta = {
  title: 'Components/Overlays/OverlayHero',
  component: OverlayHero,
  args: { config: DEFAULT_CONFIG },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '70vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OverlayHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Default config produces at least one text layer', async () => {
      const allText = canvas.queryAllByText(/\S/)
      await expect(allText.length).toBeGreaterThan(0)
    })
  },
}
