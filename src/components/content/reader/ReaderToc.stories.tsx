import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderToc } from './ReaderToc'

const meta: Meta<typeof ReaderToc> = {
  title: 'Components/Content/Reader/ReaderToc',
  component: ReaderToc,
  parameters: { layout: 'centered' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: {
    accent: 'cyan',
    sections: [
      { num: 1, numLabel: '01', text: 'Highlights', id: 'sec-01' },
      { num: 2, numLabel: '02', text: 'Vendor Rotation', id: 'sec-02' },
      { num: 3, numLabel: '03', text: 'Mission Pacing', id: 'sec-03' },
      { num: 4, numLabel: '04', text: 'Build Meta Shifts', id: 'sec-04' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, width: 240, background: '#080808' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = { args: { sections: [] } }
