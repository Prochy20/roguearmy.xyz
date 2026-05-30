import type { TrailSegment } from './StatRibbon'

/**
 * Canonical "first segment" anchors for the StatRibbon breadcrumb trail.
 * Pages compose their trail by spreading the appropriate root then appending
 * deeper segments. Centralizing these keeps labels + hrefs consistent across
 * the ~15 ribbon callsites and makes a future label change a one-line edit.
 *
 * Phase 2 will add RGA_ROOT (brand root for non-D2 surfaces), CONTENT_ROOT,
 * ESCALATION_ROOT, CLANS_ROOT, COMMUNITY_ROOT as their pages migrate.
 */

export const D2_ROOT: TrailSegment = {
  label: 'Division 2',
  href: '/division-2',
}

export const BRIEFINGS_ROOT: TrailSegment = {
  label: 'Briefings',
  href: '/division-2/briefings',
}
