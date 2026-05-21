import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SeriesCard } from './SeriesCard'

const HERO = {
  url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=70',
  alt: 'Cyberpunk neon alley',
}

const meta = {
  title: 'Components/Members/SeriesCard',
  component: SeriesCard,
  argTypes: {
    articleCount: { control: { type: 'number', min: 0 } },
    completedCount: { control: { type: 'number', min: 0 } },
    inProgressCount: { control: { type: 'number', min: 0 } },
  },
  args: {
    id: 'srs_ops',
    slug: 'operator-onboarding',
    name: 'OPERATOR ONBOARDING',
    description: 'Five-part field guide for first-week operators. Covers handshakes, sigils, and the dossier protocol.',
    heroImage: HERO,
    articleCount: 5,
    completedCount: 0,
    inProgressCount: 0,
    index: 0,
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SeriesCard>

export default meta
type Story = StoryObj<typeof meta>

export const NotStarted: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders the series name + "Not started" label', async () => {
      await expect(canvas.getByText(args.name)).toBeInTheDocument()
      await expect(canvas.getByText(/not started/i)).toBeInTheDocument()
    })
  },
}

export const InProgress: Story = {
  args: { completedCount: 2, inProgressCount: 1 },
}

export const Complete: Story = {
  args: { completedCount: 5 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('"COMPLETE" badge shows when all articles are done', async () => {
      await expect(canvas.getByText(/^complete$/i)).toBeInTheDocument()
    })
  },
}

export const NoHero: Story = {
  args: { heroImage: null },
}

export const SingleArticle: Story = {
  args: { articleCount: 1 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Pluralisation: 1 article (singular)', async () => {
      await expect(canvas.getByText(/^1 article$/i)).toBeInTheDocument()
    })
  },
}
