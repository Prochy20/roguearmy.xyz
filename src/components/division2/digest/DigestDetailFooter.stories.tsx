import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestDetailFooter } from './DigestDetailFooter'
import { MOCK_DIGEST_DAILY, MOCK_DIGEST_WEEKLY } from '../_mock'

const meta = {
  title: 'Components/Division2/Digest/DigestDetailFooter',
  component: DigestDetailFooter,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: {
    accent: 'cyan',
    weekPeriodStart: '2026-05-19',
    prev: MOCK_DIGEST_WEEKLY,
    next: MOCK_DIGEST_DAILY,
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DigestDetailFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Back link points to /division-2/digest?week=...', async () => {
      const back = canvas.getByRole('link', { name: /back to week/i })
      await expect(back).toHaveAttribute('href', '/division-2/digest?week=2026-05-19')
    })
  },
}

export const AtBoundary: Story = {
  args: { prev: null, next: null },
}
