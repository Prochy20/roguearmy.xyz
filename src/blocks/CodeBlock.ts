import { Block } from 'payload'

/**
 * Code block for rich text editor.
 * Supports syntax highlighting for various languages.
 */
export const CodeBlock: Block = {
  slug: 'codeBlock',
  imageURL:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="m18 16 4-4-4-4"/%3E%3Cpath d="m6 8-4 4 4 4"/%3E%3Cpath d="m14.5 4-5 16"/%3E%3C/svg%3E',
  imageAltText: 'Code block',
  interfaceName: 'CodeBlockType',
  labels: {
    singular: 'Code Block',
    plural: 'Code Blocks',
  },
  fields: [
    {
      name: 'language',
      type: 'select',
      required: true,
      defaultValue: 'typescript',
      options: [
        { label: 'TypeScript', value: 'typescript' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TSX', value: 'tsx' },
        { label: 'JSX', value: 'jsx' },
        { label: 'Python', value: 'python' },
        { label: 'Ruby', value: 'ruby' },
        { label: 'Go', value: 'go' },
        { label: 'Rust', value: 'rust' },
        { label: 'C++', value: 'cpp' },
        { label: 'C', value: 'c' },
        { label: 'C#', value: 'csharp' },
        { label: 'Java', value: 'java' },
        { label: 'PHP', value: 'php' },
        { label: 'Swift', value: 'swift' },
        { label: 'Kotlin', value: 'kotlin' },
        { label: 'SQL', value: 'sql' },
        { label: 'JSON', value: 'json' },
        { label: 'YAML', value: 'yaml' },
        { label: 'XML', value: 'xml' },
        { label: 'HTML', value: 'html' },
        { label: 'CSS', value: 'css' },
        { label: 'SCSS', value: 'scss' },
        { label: 'Markdown', value: 'markdown' },
        { label: 'Shell/Bash', value: 'bash' },
        { label: 'PowerShell', value: 'powershell' },
        { label: 'Dockerfile', value: 'dockerfile' },
        { label: 'GraphQL', value: 'graphql' },
        { label: 'Prisma', value: 'prisma' },
        { label: 'Plain Text', value: 'text' },
      ],
    },
    {
      name: 'code',
      type: 'code',
      required: true,
      label: 'Code',
      admin: {
        language: 'typescript',
      },
    },
  ],
}
