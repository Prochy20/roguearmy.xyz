import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BriefingPanel } from './BriefingPanel'
import { MOCK_DIGEST_DAILY, MOCK_DIGEST_WEEKLY } from '../_mock'

const PERKS = {
  enabled: true,
  kicker: '// COMMUNITY-FUNDED',
  heading: 'BOOST · UNLOCK DAILIES',
  body: 'Boost the server, see the daily briefing.',
  fundBullets: [],
  bullets: [],
  cta: { label: 'BOOST', url: 'https://dc.roguearmy.xyz/boost' },
}

const meta = {
  title: 'Components/Division2/Landing/BriefingPanel',
  component: BriefingPanel,
  args: {
    digest: MOCK_DIGEST_WEEKLY,
    dailies: [MOCK_DIGEST_DAILY],
    hasAccess: true,
    perks: PERKS,
  },
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
} satisfies Meta<typeof BriefingPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Booster: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Weekly card title renders', async () => {
      await expect(canvas.getByText(MOCK_DIGEST_WEEKLY.title)).toBeInTheDocument()
    })
  },
}

export const NonBooster: Story = {
  args: { dailies: null, hasAccess: false },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Falls back to the booster perks widget', async () => {
      await expect(canvas.getByText(/boost · unlock dailies/i)).toBeInTheDocument()
    })
  },
}
