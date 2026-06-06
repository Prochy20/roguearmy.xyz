import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ClanCard } from './ClanCard'
import {
  MOCK_CLAN_RGA,
  MOCK_CLAN_SDC,
  MOCK_CLAN_RGS,
  MOCK_CLAN_ROSTER,
} from './_mock'

const meta = {
  title: 'Components/Division2/Clans/ClanCard',
  component: ClanCard,
  args: {
    name: MOCK_CLAN_RGA.name,
    tag: MOCK_CLAN_RGA.tag,
    bannerUrl: MOCK_CLAN_RGA.bannerUrl,
    bannerAlt: MOCK_CLAN_RGA.bannerAlt,
    accent: MOCK_CLAN_RGA.accent,
    index: 1,
    leader: null,
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClanCard>

export default meta
type Story = StoryObj<typeof meta>

export const Anonymous: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Name + tag render; leader slot is hidden for anon', async () => {
      await expect(canvas.getByText(args.name)).toBeInTheDocument()
      await expect(canvas.getByText(args.tag)).toBeInTheDocument()
      await expect(canvas.queryByText(/FIRETEAM LEAD/i)).not.toBeInTheDocument()
    })
  },
}

export const WithLeader: Story = {
  args: { leader: MOCK_CLAN_RGA.leader },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Leader slot renders FIRETEAM LEAD label + display name', async () => {
      await expect(canvas.getByText(/FIRETEAM LEAD/i)).toBeInTheDocument()
      await expect(canvas.getByText('MAVERICK')).toBeInTheDocument()
    })
  },
}

export const LongName: Story = {
  args: {
    name: 'A Very Long Clan Name That Should Truncate Inside The Card',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Long clan name is preserved in the title attribute for hover', async () => {
      const heading = canvas.getByRole('heading', { level: 3 })
      await expect(heading).toHaveAttribute(
        'title',
        'A Very Long Clan Name That Should Truncate Inside The Card',
      )
    })
  },
}

export const Gallery: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {MOCK_CLAN_ROSTER.map((clan, i) => (
        <ClanCard
          key={clan.id}
          name={clan.name}
          tag={clan.tag}
          bannerUrl={clan.bannerUrl}
          bannerAlt={clan.bannerAlt}
          accent={clan.accent}
          index={i + 1}
          leader={clan.leader}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All three clan tags render across the three accent variants', async () => {
      await expect(canvas.getByText(MOCK_CLAN_RGA.tag)).toBeInTheDocument()
      await expect(canvas.getByText(MOCK_CLAN_SDC.tag)).toBeInTheDocument()
      await expect(canvas.getByText(MOCK_CLAN_RGS.tag)).toBeInTheDocument()
    })
  },
}
