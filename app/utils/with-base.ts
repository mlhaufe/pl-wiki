/**
 * Prefix an app-absolute path (e.g. `/logos/x.png`) with the configured app
 * base URL (`/pl-wiki/` on GitHub Pages), so static assets resolve in both
 * dev and the deployed project site. Frontmatter stores base-less absolute
 * paths; templates must route them through this helper in any `src`/`href`.
 */
export function useBaseUrl(): string {
  const { app } = useRuntimeConfig()
  return app.baseURL.replace(/\/$/, '')
}

export function withBase(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  const base = useBaseUrl()
  return path.startsWith('/') ? `${base}${path}` : path
}