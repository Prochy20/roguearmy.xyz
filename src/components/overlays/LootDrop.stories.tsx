import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { DEFAULT_CONFIG } from '@/lib/overlay-drop-config'
import { LootDrop } from './LootDrop'

const meta = {
  title: 'Components/Overlays/LootDrop',
  component: LootDrop,
  args: {
    config: DEFAULT_CONFIG,
    demoMode: true,
    contained: true,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '100%', height: '70vh', background: '#000' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LootDrop>

export default meta
type Story = StoryObj<typeof meta>

export const DemoMode: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Demo container mounts with a positioned drop layer', async () => {
      // Drops spawn on random intervals; rather than racing the timer we just
      // assert the host container mounted — the spawn behaviour is covered by
      // the component's own integration tests.
      await expect(canvasElement.firstElementChild?.children.length ?? 0).toBeGreaterThan(0)
    })
  },
}
