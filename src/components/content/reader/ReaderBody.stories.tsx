import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderBody } from './ReaderBody'

const meta: Meta<typeof ReaderBody> = {
  title: 'Components/Content/Reader/ReaderBody',
  component: ReaderBody,
  parameters: { layout: 'centered' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: {
    accent: 'cyan',
    source: {
      type: 'markdown',
      content: `<h2 id="sec-01" data-sec-num="01">Highlights</h2>

This week was about consolidation. Three things shifted: vendor cache,
patch notes, and a route fix.

::tip[Operator tip]
Hit Capitol before reset for the best XP-per-hour window.
::

<h2 id="sec-02" data-sec-num="02">Vendor Rotation</h2>

Protocol vendor swapped to **Holster + Rifle** slots. See [patch
notes](https://example.com/patch) for the brand set tuning.

![Sample image with caption](https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=70)
`,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32, width: 720, background: '#080808' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
