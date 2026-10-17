export function assetUrl(path: string) {
  if (!path || /^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }
  const base = String(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}` || normalized
}
