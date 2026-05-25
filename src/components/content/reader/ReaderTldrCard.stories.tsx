import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderTldrCard } from './ReaderTldrCard'

const meta: Meta<typeof ReaderTldrCard> = {
  title: 'Components/Content/Reader/ReaderTldrCard',
  component: ReaderTldrCard,
  parameters: { layout: 'centered' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: {
    accent: 'cyan',
    highlights: [
      'Tidal Basin remains the top XP-per-hour run for the third week in a row.',
      'Vendor cache rotated to Holster + Rifle — Friday slot is the best window.',
      'Patch 23.5 dropped — brand set tuning favors backline marksman roles.',
      'Operatives reported a 12% completion bump on Capitol after the route fix.',
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, width: 720, background: '#080808' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Sentinel for the empty-state contract: passing `highlights=[]` returns
 * null so the page doesn't render an empty card shell. Article callers
 * rely on this — articles without editor-curated highlights show no card.
 */
export const Empty: Story = {
  args: { highlights: [] },
}
