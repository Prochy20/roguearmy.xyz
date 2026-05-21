import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ErrorPage } from './ErrorPage'
import type { ErrorCode } from './error-config'

const ALL_CODES: ErrorCode[] = ['404', '401', '403', '400', '500', '502', '503', 'BAN', 'AWOL']

const meta = {
  title: 'Components/Error/ErrorPage',
  component: ErrorPage,
  argTypes: {
    errorType: { control: 'select', options: ALL_CODES },
    showHomeButton: { control: 'boolean' },
    showRetryButton: { control: 'boolean' },
  },
  args: {
    errorType: '404',
    showHomeButton: true,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/some/missing/page' } },
  },
} satisfies Meta<typeof ErrorPage>

export default meta
type Story = StoryObj<typeof meta>

export const NotFound: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Glitched 404 code appears once mount effects run', async () => {
      // "SIGNAL LOST" renders in both the main title and the chromatic
      // ghost copies stacked behind it, so multiple matches are expected.
      const titles = await canvas.findAllByText(/signal lost/i, {}, { timeout: 2000 })
      await expect(titles.length).toBeGreaterThan(0)
    })
    await step('Home CTA links to /', async () => {
      const link = canvas.getByRole('link', { name: /go home/i })
      await expect(link).toHaveAttribute('href', '/')
    })
  },
}

export const Unauthorized: Story = { args: { errorType: '401' } }
export const Forbidden: Story = { args: { errorType: '403' } }
export const ServerCrash: Story = { args: { errorType: '500' } }
export const Banned: Story = { args: { errorType: 'BAN' } }
export const Awol: Story = { args: { errorType: 'AWOL' } }

export const WithRetry: Story = {
  args: { errorType: '500', reset: fn() },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Clicking "Try Again" fires the reset callback', async () => {
      const retry = await canvas.findByRole('button', { name: /try again/i }, { timeout: 2000 })
      await userEvent.click(retry)
      await expect(args.reset).toHaveBeenCalledTimes(1)
    })
  },
}
