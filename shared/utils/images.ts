const FALLBACK_PRODUCT_IMAGE = "/products/cabelos/oleo-capilar.webp"

export function normalizeProductImageSrc(src: string) {
  const normalizedSrc = src.trim().replaceAll("\\", "/")

  if (!normalizedSrc) {
    return FALLBACK_PRODUCT_IMAGE
  }

  if (/^https?:\/\//.test(normalizedSrc)) {
    return normalizedSrc
  }

  return normalizedSrc.startsWith("/") ? normalizedSrc : `/${normalizedSrc}`
}
