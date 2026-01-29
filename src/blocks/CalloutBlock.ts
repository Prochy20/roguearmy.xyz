import { Block } from 'payload'
import { lexicalEditor, HeadingFeature, BoldFeature, ItalicFeature, UnderlineFeature, LinkFeature, InlineCodeFeature } from '@payloadcms/richtext-lexical'

/**
 * Callout block for rich text editor.
 * Supports 7 callout types with optional custom title.
 */
export const CalloutBlock: Block = {
  slug: 'callout',
  imageURL:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="m3 11 18-5v12L3 14v-3z"/%3E%3Cpath d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/%3E%3C/svg%3E',
  imageAltText: 'Callout block',
  interfaceName: 'CalloutBlockType',
  labels: {
    singular: 'Callout',
    plural: 'Callouts',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Tip', value: 'tip' },
        { label: 'Success', value: 'success' },
        { label: 'Danger', value: 'danger' },
        { label: 'Error', value: 'error' },
        { label: 'Note', value: 'note' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: 'Custom Title (optional)',
      admin: {
        placeholder: 'Leave empty to use default label',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Content',
      // Sub-richText fields require explicit editor to avoid infinite recursion
      editor: lexicalEditor({
        features: [
          HeadingFeature({ enabledHeadingSizes: ['h4', 'h5', 'h6'] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          LinkFeature(),
          InlineCodeFeature(),
        ],
      }),
    },
  ],
}
