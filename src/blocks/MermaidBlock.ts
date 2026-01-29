import { Block } from 'payload'

/**
 * Mermaid diagram block for rich text editor.
 * Renders flowcharts, sequence diagrams, and other Mermaid.js diagrams.
 */
export const MermaidBlock: Block = {
  slug: 'mermaid',
  imageURL:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="8" height="8" x="3" y="3" rx="2"/%3E%3Cpath d="M7 11v4a2 2 0 0 0 2 2h4"/%3E%3Crect width="8" height="8" x="13" y="13" rx="2"/%3E%3C/svg%3E',
  imageAltText: 'Mermaid diagram block',
  interfaceName: 'MermaidBlockType',
  labels: {
    singular: 'Mermaid Diagram',
    plural: 'Mermaid Diagrams',
  },
  fields: [
    {
      name: 'code',
      type: 'code',
      required: true,
      label: 'Mermaid Code',
      admin: {
        language: 'markdown',
        description: 'Enter Mermaid diagram syntax (flowchart, sequence, etc.)',
      },
    },
  ],
}
