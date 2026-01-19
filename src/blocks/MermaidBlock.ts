import { Block } from 'payload'

/**
 * Mermaid diagram block for rich text editor.
 * Renders flowcharts, sequence diagrams, and other Mermaid.js diagrams.
 */
export const MermaidBlock: Block = {
  slug: 'mermaid',
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
