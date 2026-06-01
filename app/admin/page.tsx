"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { normalizeProductImageSrc } from "@/utils/images"

type Product = {
  id: string
  title: string
  category: string
  price: number
  image: string
  featured: boolean
}

export default function AdminPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [adminSearch, setAdminSearch] = useState("")

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Cabelos")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")
  const [featured, setFeatured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  async function loadProducts() {
    const response = await fetch("/api/products")
    const data = await response.json()
    setProducts(data)
  }

  useEffect(() => {
    let ignore = false

    void fetch("/api/admin/session")
      .then((response) => {
        if (!response.ok) {
          router.push("/admin-login")
          return null
        }

        return fetch("/api/products")
      })
      .then((response) => response?.json())
      .then((data) => {
        if (!ignore && data) {
          setProducts(data)
        }
      })
      .finally(() => {
        if (!ignore) {
          setCheckingAccess(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [router])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    setLoading(true)

    const response = await fetch(
      editingProductId
        ? `/api/products/${editingProductId}`
        : "/api/products",
      {
        method: editingProductId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
          price,
          image,
          featured,
        }),
      }
    )

    if (response.status === 401) {
      setLoading(false)
      router.push("/admin-login")
      return
    }

    setTitle("")
    setCategory("Cabelos")
    setPrice("")
    setImage("")
    setFeatured(false)
    setEditingProductId(null)
    setLoading(false)

    await loadProducts()

    alert(
      editingProductId
        ? "Produto atualizado com sucesso!"
        : "Produto cadastrado com sucesso!"
    )
  }

  function handleEdit(product: Product) {
    setEditingProductId(product.id)
    setTitle(product.title)
    setCategory(product.category)
    setPrice(String(product.price))
    setImage(product.image)
    setFeatured(product.featured)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Tem certeza que deseja excluir este produto?"
    )

    if (!confirmDelete) return

    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    })

    if (response.status === 401) {
      router.push("/admin-login")
      return
    }

    await loadProducts()

    alert("Produto excluído com sucesso!")
  }

  const filteredProducts = products.filter((product) => {
    const searchText = adminSearch.toLowerCase().trim()

    return (
      product.title.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText) ||
      String(product.price).includes(searchText)
    )
  })

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
        <p className="text-[#5C5C5C]">Verificando acesso...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex justify-end">
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", {
                method: "POST",
              })

              router.push("/admin-login")
            }}
            className="rounded-full border border-[#E7E1D8] bg-white px-5 py-2 text-sm transition hover:border-red-300 hover:text-red-500"
          >
            Sair
          </button>
        </div>

        <section className="rounded-[32px] bg-white p-8 shadow-xl">
          <div className="mb-8">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B28A22]">
              Admin
            </span>

            <h1 className="mt-3 text-4xl font-bold text-[#1A1A1A]">
              {editingProductId ? "Editar Produto" : "Cadastrar Produto"}
            </h1>

            <p className="mt-3 text-[#5C5C5C]">
              Gerencie os produtos da CS Store sem mexer no código.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nome do produto
              </label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#E7E1D8] px-4 py-3 outline-none focus:border-[#D4AF37]"
                placeholder="Ex: Óleo Capilar Premium"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Categoria
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-2xl border border-[#E7E1D8] px-4 py-3 outline-none focus:border-[#D4AF37]"
              >
                <option value="Cabelos">Cabelos</option>
                <option value="Cosméticos">Cosméticos</option>
                <option value="Acessórios">Acessórios</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Preço
              </label>

              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
                type="number"
                step="0.01"
                className="w-full rounded-2xl border border-[#E7E1D8] px-4 py-3 outline-none focus:border-[#D4AF37]"
                placeholder="Ex: 129.90"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Caminho da imagem
              </label>

              <input
                value={image}
                onChange={(event) => setImage(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#E7E1D8] px-4 py-3 outline-none focus:border-[#D4AF37]"
                placeholder="/products/produto.jpg"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-[#E7E1D8] p-4 md:col-span-2">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
              />

              <span>Marcar como produto em destaque</span>
            </label>

            <button
              disabled={loading}
              className="rounded-full bg-[#D4AF37] py-4 font-semibold text-black transition hover:bg-[#C89B2C] disabled:opacity-60 md:col-span-2"
            >
              {loading
                ? "Salvando..."
                : editingProductId
                  ? "Atualizar Produto"
                  : "Salvar Produto"}
            </button>
          </form>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-xl">
          <div className="mb-6">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B28A22]">
              Produtos
            </span>

            <h2 className="mt-3 text-3xl font-bold text-[#1A1A1A]">
              Produtos cadastrados
            </h2>

            <input
              value={adminSearch}
              onChange={(event) => setAdminSearch(event.target.value)}
              placeholder="Pesquisar produto..."
              className="mt-6 w-full rounded-2xl border border-[#E7E1D8] px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 rounded-3xl border border-[#E7E1D8] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={normalizeProductImageSrc(product.image)}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />

                  <div>
                    <h3 className="font-semibold text-[#1A1A1A]">
                      {product.title}
                    </h3>

                    <p className="text-sm text-[#5C5C5C]">
                      {product.category} •{" "}
                      {product.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>

                    {product.featured && (
                      <span className="mt-2 inline-block rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-semibold text-[#B28A22]">
                        Destaque
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="rounded-full border border-[#E7E1D8] px-4 py-2 text-sm transition hover:border-[#D4AF37] hover:text-[#B28A22]"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <p className="text-[#5C5C5C]">
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
