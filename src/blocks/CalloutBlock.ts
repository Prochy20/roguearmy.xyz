import { Block } from 'payload'
import { lexicalEditor, HeadingFeature, BoldFeature, ItalicFeature, UnderlineFeature, LinkFeature, InlineCodeFeature } from '@payloadcms/richtext-lexical'

/**
 * Callout block for rich text editor.
 * Supports 7 callout types with optional custom title.
 */
export const CalloutBlock: Block = {
  slug: 'callout',
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
