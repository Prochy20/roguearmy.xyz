import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReaderHeroFrame } from './ReaderHeroFrame'
import type { AccentName } from './accent'

const meta: Meta<typeof ReaderHeroFrame> = {
  title: 'Components/Content/Reader/ReaderHeroFrame',
  component: ReaderHeroFrame,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    accent: {
      control: 'inline-radio',
      options: ['green', 'cyan', 'magenta', 'orange', 'red'],
    },
  },
  args: {
    accent: 'cyan',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=70',
    kindLabel: 'WEEKLY',
    periodLabel: 'MAY 19 → MAY 25',
    bylineLabel: '// AI · ASHLEY',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, background: '#080808', minWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ArticleHero: Story = {
  args: {
    accent: 'green',
    kindLabel: 'BUILDS',
    periodLabel: 'MAY 20',
    bylineLabel: undefined,
  },
}

/**
 * Single-page reference for all five accents. Helps spot-check that the
 * frame ticks + radial backlight track the new accents correctly.
 */
export const AccentGallery: Story = {
  render: (args) => {
    const accents: AccentName[] = ['green', 'cyan', 'magenta', 'orange', 'red']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {accents.map((a) => (
          <ReaderHeroFrame key={a} {...args} accent={a} kindLabel={a.toUpperCase()} />
        ))}
      </div>
    )
  },
}
