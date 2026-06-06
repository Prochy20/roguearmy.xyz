import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderDocStrip } from './ReaderDocStrip'

const meta: Meta<typeof ReaderDocStrip> = {
  title: 'Components/Content/Reader/ReaderDocStrip',
  component: ReaderDocStrip,
  parameters: { layout: 'centered' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: {
    accent: 'cyan',
    fields: [
      { label: 'DOC', value: 'WK21_2026', tone: 'accent' },
      { label: 'CLASS', value: 'WEEKLY', tone: 'muted' },
      { label: 'WORDS', value: '2,108', tone: 'secondary' },
      { label: 'UPDATED', value: 'MAY 26', tone: 'secondary' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, minWidth: 720, background: '#080808' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ArticleFields: Story = {
  args: {
    accent: 'green',
    fields: [
      { label: 'DOC', value: 'BUILDS-META', tone: 'accent' },
      { label: 'CLASS', value: 'BUILDS', tone: 'muted' },
      { label: 'WORDS', value: '1,234', tone: 'secondary' },
      { label: 'PUBLISHED', value: 'MAY 20', tone: 'secondary' },
    ],
  },
}
