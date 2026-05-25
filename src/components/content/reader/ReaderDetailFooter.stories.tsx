import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderDetailFooter } from './ReaderDetailFooter'

const meta: Meta<typeof ReaderDetailFooter> = {
  title: 'Components/Content/Reader/ReaderDetailFooter',
  component: ReaderDetailFooter,
  parameters: { layout: 'centered' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: {
    accent: 'cyan',
    backHref: '/division-2/briefings?week=2026-05-19',
    backLabel: 'WEEK',
    backValue: 'MAY 19',
    prev: { href: '/division-2/briefings/d1', label: 'DAILY', sublabel: 'MAY 18' },
    next: { href: '/division-2/briefings/d2', label: 'WEEKLY', sublabel: 'MAY 26' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, width: 800, background: '#080808' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ArticleFooter: Story = {
  args: {
    accent: 'green',
    backHref: '/blog/builds',
    backLabel: 'BUILDS',
    backValue: 'MAY 20',
    prev: { href: '/blog/builds/prev', label: 'BUILDS', sublabel: 'MAY 18' },
    next: { href: '/blog/builds/next', label: 'BUILDS', sublabel: 'MAY 22' },
  },
}

export const NoNeighbors: Story = {
  args: { prev: null, next: null },
}
