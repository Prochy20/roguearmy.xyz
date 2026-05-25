import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderActions } from './ReaderActions'

const meta: Meta<typeof ReaderActions> = {
  title: 'Components/Content/Reader/ReaderActions',
  component: ReaderActions,
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
      <div style={{ padding: 32, background: '#080808' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
