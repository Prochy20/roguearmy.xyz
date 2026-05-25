import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderReadingWidget } from './ReaderReadingWidget'

const meta: Meta<typeof ReaderReadingWidget> = {
  title: 'Components/Content/Reader/ReaderReadingWidget',
  component: ReaderReadingWidget,
  parameters: { layout: 'centered' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: { accent: 'cyan', wordCount: 2108 },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, width: 260, background: '#080808' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
