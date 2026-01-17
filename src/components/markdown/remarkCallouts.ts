import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

/**
 * Supported callout types and their aliases
 */
const CALLOUT_TYPES = new Set([
  'info',
  'warning',
  'tip',
  'success',
  'danger',
  'error',
  'note',
])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DirectiveNode = any

/**
 * Remark plugin to transform container directives (:::type ... :::)
 * into <aside> elements with data attributes for rendering as callouts.
 *
 * Transforms:
 * ```markdown
 * :::info
 * Some information
 * :::
 * ```
 *
 * Into an AST node that renders as:
 * ```html
 * <aside data-callout="info">Some information</aside>
 * ```
 */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'containerDirective', (node: DirectiveNode) => {
      const calloutType = node.name?.toLowerCase()

      if (!CALLOUT_TYPES.has(calloutType)) {
        return
      }

      // Transform the directive into an aside element
      node.data = node.data || {}
      node.data.hName = 'aside'
      node.data.hProperties = {
        'data-callout': calloutType,
        // Pass through any custom attributes
        ...(node.attributes?.title && { 'data-title': node.attributes.title }),
      }
    })
  }
}
