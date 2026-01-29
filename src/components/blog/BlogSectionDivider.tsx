interface BlogSectionDividerProps {
  label: string
}

/**
 * Section divider with label and horizontal line
 * Used to separate sections in the featured blog layout
 */
export function BlogSectionDivider({ label }: BlogSectionDividerProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-rga-gray/50 tracking-wider uppercase shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-rga-gray/20" />
    </div>
  )
}
