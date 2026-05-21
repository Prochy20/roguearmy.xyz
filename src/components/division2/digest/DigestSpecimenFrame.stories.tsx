import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestSpecimenFrame } from './DigestSpecimenFrame'
import { MOCK_DIGEST_DETAIL } from '../_mock'

const meta = {
  title: 'Components/Division2/Digest/DigestSpecimenFrame',
  component: DigestSpecimenFrame,
  args: { digest: MOCK_DIGEST_DETAIL },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof DigestSpecimenFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Weekly: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Title + WEEKLY tag render in the specimen card', async () => {
      await expect(canvas.getByText(args.digest.title)).toBeInTheDocument()
      await expect(canvas.getByText(/^WEEKLY$/)).toBeInTheDocument()
    })
  },
}

export const Daily: Story = {
  args: { digest: { ...MOCK_DIGEST_DETAIL, frequency: 'daily' } },
}
