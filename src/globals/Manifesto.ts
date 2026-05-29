import type { GlobalConfig, Field } from 'payload'
import { publicRead } from '@/access'

/**
 * Creates the shared field set for each manifesto document tab (rules, privacy, terms).
 * Each document has metadata fields plus a content source toggle (payload richText vs Outline wiki).
 */
function createDocumentFields(): Field[] {
  return [
    {
      name: 'code',
      type: 'text',
      required: true,
      admin: {
        description: 'Document code identifier (e.g. DOC_01)',
      },
    },
    {
      name: 'kicker',
      type: 'text',
      admin: {
        description: 'Small text above the title (e.g. "House rules")',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Main display title',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      admin: {
        description: 'Paragraph below the title explaining the document',
      },
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        description: 'Document version (e.g. 4.2)',
      },
    },
    {
      name: 'contentSource',
      type: 'radio',
      defaultValue: 'payload',
      options: [
        { label: 'Payload Content', value: 'payload' },
        { label: 'Wiki Link', value: 'wiki' },
      ],
      admin: {
        description: 'Choose where the document content comes from',
        layout: 'horizontal',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        condition: (_, siblingData) => siblingData?.contentSource !== 'wiki',
        description: 'Use headings (H2) to create numbered sections',
      },
    },
    {
      name: 'outlineDocumentId',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.contentSource === 'wiki',
        description: 'Select a published document from the Outline wiki',
        components: {
          Field: '@/components/admin/OutlineDocumentSelector',
        },
      },
    },
  ]
}

export const Manifesto: GlobalConfig = {
  slug: 'manifesto',
  access: {
    read: publicRead,
  },
  admin: {
    group: 'Identity',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'rules',
          label: 'Rules',
          fields: [
            ...createDocumentFields(),
            {
              type: 'collapsible',
              label: 'Simplified Rules (CASUAL Mode)',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'simplifiedContentSource',
                  type: 'radio',
                  defaultValue: 'payload',
                  options: [
                    { label: 'Payload Content', value: 'payload' },
                    { label: 'Wiki Link', value: 'wiki' },
                  ],
                  admin: {
                    description: 'Content source for the simplified (CASUAL) version of the rules',
                    layout: 'horizontal',
                  },
                },
                {
                  name: 'simplifiedContent',
                  type: 'richText',
                  admin: {
                    condition: (_, siblingData) => siblingData?.simplifiedContentSource !== 'wiki',
                    description: 'Simplified rules shown in CASUAL mode. Use H2 headings for sections.',
                  },
                },
                {
                  name: 'simplifiedOutlineDocumentId',
                  type: 'text',
                  admin: {
                    condition: (_, siblingData) => siblingData?.simplifiedContentSource === 'wiki',
                    description: 'Outline wiki document for simplified rules',
                    components: {
                      Field: '@/components/admin/OutlineDocumentSelector',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'privacy',
          label: 'Privacy Policy',
          fields: createDocumentFields(),
        },
        {
          name: 'terms',
          label: 'Terms of Use',
          fields: createDocumentFields(),
        },
      ],
    },
  ],
}
