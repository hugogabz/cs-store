export function normalizeStock(value: unknown) {
  const stock = Number.parseInt(String(value ?? "0"), 10)

  if (!Number.isFinite(stock)) return 0

  return Math.max(0, stock)
}

export function generateFakeRating() {
  const ratingOptions = [4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]
  const randomIndex = Math.floor(Math.random() * ratingOptions.length)

  return ratingOptions[randomIndex]
}

export function normalizeRating(value: unknown) {
  const rating = Number(value ?? generateFakeRating())

  if (!Number.isFinite(rating)) return generateFakeRating()

  return Math.min(5, Math.max(4, Number(rating.toFixed(1))))
}

export function generateFakeRatingCount() {
  return Math.floor(Math.random() * 239) + 12
}

export function normalizeRatingCount(value: unknown) {
  const ratingCount = Number.parseInt(String(value ?? generateFakeRatingCount()), 10)

  if (!Number.isFinite(ratingCount)) return generateFakeRatingCount()

  return Math.max(0, ratingCount)
}
