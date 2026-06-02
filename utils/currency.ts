export function toNumberPrice(price: number | string) {
  if (typeof price === "number") {
    return Number.isFinite(price) ? price : 0
  }

  const numericPrice = Number(
    price
      .replace("R$", "")
      .replace(",", ".")
      .trim()
  )

  return Number.isFinite(numericPrice) ? numericPrice : 0
}

export function formatCurrency(price: number | string) {
  return toNumberPrice(price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
