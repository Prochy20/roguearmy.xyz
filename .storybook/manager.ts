import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

const rgaTheme = create({
  base: 'dark',

  brandTitle: 'RGA — Brand Manual',
  brandUrl: 'https://roguearmy.xyz',

  colorPrimary: '#00FF41',
  colorSecondary: '#00FFFF',

  appBg: '#030303',
  appContentBg: '#0A0A0A',
  appPreviewBg: '#030303',
  appBorderColor: 'rgba(0, 255, 65, 0.15)',
  appBorderRadius: 0,

  fontBase: '"Outfit", system-ui, sans-serif',
  fontCode: '"JetBrains Mono", ui-monospace, monospace',

  textColor: '#FFFFFF',
  textInverseColor: '#030303',
  textMutedColor: '#888888',

  barTextColor: '#888888',
  barHoverColor: '#00FFFF',
  barSelectedColor: '#00FF41',
  barBg: '#0A0A0A',

  buttonBg: '#111111',
  buttonBorder: 'rgba(0, 255, 65, 0.25)',
  booleanBg: '#1A1A1A',
  booleanSelectedBg: '#00FF41',

  inputBg: '#111111',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputTextColor: '#FFFFFF',
  inputBorderRadius: 0,
})

addons.setConfig({
  theme: rgaTheme,
})
