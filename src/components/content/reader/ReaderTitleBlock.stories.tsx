import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderTitleBlock } from './ReaderTitleBlock'
import { ReaderActions } from './ReaderActions'
import type { AccentName } from './accent'

const meta: Meta<typeof ReaderTitleBlock> = {
  title: 'Components/Content/Reader/ReaderTitleBlock',
  component: ReaderTitleBlock,
  parameters: { layout: 'centered' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: {
    accent: 'cyan',
    title: 'WEEK 21 · ESCALATION ROLL-UP',
    perex:
      'Five missions, new vendor prototype caches, and the meta shift to AR-friendly builds.',
    dateLabel: 'WEEK OF MAY 19',
    readMinutes: 8,
    actions: <ReaderActions accent="cyan" />,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32, minWidth: 640, background: '#080808' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Single-page reference for all five accent channels. Each row pairs an
 * accent with its glitch color pair so the title's RGB-split tracks the
 * page channel.
 */
export const AccentGallery: Story = {
  render: (args) => {
    const accents: AccentName[] = ['green', 'cyan', 'magenta', 'orange', 'red']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
        {accents.map((a) => (
          <ReaderTitleBlock
            key={a}
            {...args}
            accent={a}
            title={`${a.toUpperCase()} CHANNEL · SAMPLE TITLE`}
            actions={<ReaderActions accent={a} />}
          />
        ))}
      </div>
    )
  },
}
