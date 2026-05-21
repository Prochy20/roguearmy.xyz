import type { Preview } from '@storybook/nextjs-vite'
import { themes } from 'storybook/theming'

import '../src/app/globals.css'

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'void',
      values: [
        { name: 'void', value: '#030303' },
        { name: 'primary', value: '#0A0A0A' },
        { name: 'elevated', value: '#111111' },
        { name: 'surface', value: '#1A1A1A' },
        { name: 'light', value: '#FFFFFF' },
      ],
    },
    docs: {
      theme: themes.dark,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: [
          'Brand',
          ['Introduction', 'Logo', 'Colors', 'Typography', 'Gradients', 'Effects'],
          'Components',
          ['UI', 'Shared', 'Effects'],
          'Page Templates',
          '*',
        ],
      },
    },
  },
}

export default preview
