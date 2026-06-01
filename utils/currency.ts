export function toNumberPrice(price: number | string) {
  if (typeof price === "number") return price

  return Number(
    price
      .replace("R$", "")
      .replace(",", ".")
      .trim()
  )
}

export function formatCurrency(price: number | string) {
  return toNumberPrice(price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
