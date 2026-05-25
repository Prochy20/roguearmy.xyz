import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderShortcuts } from './ReaderShortcuts'

const meta: Meta<typeof ReaderShortcuts> = {
  title: 'Components/Content/Reader/ReaderShortcuts',
  component: ReaderShortcuts,
  parameters: { layout: 'centered' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: { accent: 'cyan' },
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
