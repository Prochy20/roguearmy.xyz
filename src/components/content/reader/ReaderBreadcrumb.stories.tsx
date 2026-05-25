import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderBreadcrumb } from './ReaderBreadcrumb'

const meta: Meta<typeof ReaderBreadcrumb> = {
  title: 'Components/Content/Reader/ReaderBreadcrumb',
  component: ReaderBreadcrumb,
  parameters: { layout: 'centered' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: {
    accent: 'cyan',
    trail: [
      { href: '/division-2', label: 'DIVISION 2' },
      { href: '/division-2/digest', label: 'BRIEFINGS' },
    ],
    designator: 'WK21_2026',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, minWidth: 480, background: '#080808' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ArticleTrail: Story = {
  args: {
    accent: 'green',
    trail: [
      { href: '/blog', label: 'BLOG' },
      { href: '/blog/builds', label: 'BUILDS' },
    ],
    designator: 'BUILDS-META',
  },
}
