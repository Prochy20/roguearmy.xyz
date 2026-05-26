import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
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
 * Thumbnail URL is null OR the remote image failed to load. The interior
 * swaps to the shared NoSignalPanel; corner ticks + film-strip metadata
 * stay intact. Use the `accent` control to switch palettes.
 */
export const NoSignal: Story = {
  args: {
    thumbnailUrl: null,
    fileNumber: 'IMG_7B2B',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Hero renders NO SIGNAL marker and OFFLINE telemetry', async () => {
      await expect(canvas.getByText('NO SIGNAL')).toBeInTheDocument()
      await expect(canvas.getByText('OFFLINE')).toBeInTheDocument()
    })
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
