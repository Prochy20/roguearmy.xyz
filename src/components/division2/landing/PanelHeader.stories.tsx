import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PanelHeader } from './PanelHeader'

const meta = {
  title: 'Components/Division2/Landing/PanelHeader',
  component: PanelHeader,
  args: {
    code: 'SEC_03',
    label: '// LATEST · WEEKLY BRIEFING',
    meta: 'MON 12 MAY',
    cta: { href: '/division-2/briefings', label: 'ALL BRIEFINGS →' },
    accent: 'cyan',
    external: false,
  },
  argTypes: {
    accent: {
      control: { type: 'select' },
      options: ['green', 'cyan', 'mod'],
    },
    external: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1080 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <PanelHeader
        code="SEC_01"
        label="// LIVE · INTEL FEED"
        meta="TOP 6"
        cta={{ href: '/division-2/content', label: 'OPEN CONTENT →' }}
        accent="mod"
      />
      <PanelHeader
        code="SEC_03"
        label="// LATEST · WEEKLY BRIEFING"
        meta="MON 12 MAY"
        cta={{ href: '/division-2/briefings', label: 'ALL BRIEFINGS →' }}
        accent="cyan"
      />
      <PanelHeader
        code="SEC_04"
        label="// SCHEDULE · DISCORD #EVENTS"
        meta="OPEN CHANNEL TO RSVP"
        cta={{ href: 'https://dc.roguearmy.xyz/events', label: 'OPEN #EVENTS →' }}
        accent="green"
        external
      />
    </div>
  ),
}
