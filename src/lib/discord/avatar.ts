/**
 * Discord avatar URL bundles returned by Ashley's member endpoints. Ashley
 * pre-renders Discord avatars at four sizes; we always pick the largest
 * (512px) so cards rendering at ~340px wide on desktop get crisp 1.5× DPR
 * coverage without upscaling artefacts.
 */
export type AvatarBundle =
  | { 64: string; 128: string; 256: string; 512: string }
  | null
  | undefined

/**
 * Pick the largest Discord-provided variant (512px) from the server-specific
 * avatar first (guild-level override), then the global avatar. Returns null
 * when neither is set.
 */
export function pickBestAvatar(server: AvatarBundle, global: AvatarBundle): string | null {
  return server?.[512] ?? global?.[512] ?? null
}
