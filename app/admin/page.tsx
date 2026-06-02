"use client"

import Image from "next/image"
import { Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { normalizeProductImageSrc } from "@/utils/images"
import { normalizeSearchText } from "@/utils/search"

type Product = {
  id: string
  title: string
  description: string | null
  category: string
  price: number
  image: string
  featured: boolean
}

type UploadResponse = {
  secureUrl: string
  publicId: string
  width: number
  height: number
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const inputClass =
  "w-full rounded-xl border border-[#E7E1D8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B89535]"

export default function AdminPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [adminSearch, setAdminSearch] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Cabelos")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [featured, setFeatured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const imagePreviewSrc = localPreview ?? (
    image.trim() ? normalizeProductImageSrc(image) : null
  )

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  function setPreviewFromFile(file: File) {
    const previewUrl = URL.createObjectURL(file)

    if (localPreview) {
      URL.revokeObjectURL(localPreview)
    }

    setLocalPreview(previewUrl)
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setCategory("Cabelos")
    setPrice("")
    setImage("")
    setLocalPreview(null)
    setFeatured(false)
    setEditingProductId(null)
  }

  async function loadProducts() {
    const response = await fetch("/api/products")

    if (!response.ok) {
      throw new Error("Erro ao carregar produtos.")
    }

    const data = await response.json()
    setProducts(data)
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.")
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("A imagem deve ter no máximo 5 MB.")
      return
    }

    setPreviewFromFile(file)
    setUploadingImage(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (response.status === 401) {
        router.push("/admin-login")
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message ?? "Erro ao enviar imagem.")
      }

      const uploadedImage = data as UploadResponse
      setImage(uploadedImage.secureUrl)
      toast.success("Imagem enviada com sucesso.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a imagem."
      )
    } finally {
      setUploadingImage(false)
    }
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
      .catch(() => {
        if (!ignore) {
          toast.error("Não foi possível carregar o painel.")
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

    if (!image) {
      toast.error("Selecione uma imagem antes de salvar o produto.")
      return
    }

    if (uploadingImage) {
      toast.error("Aguarde o upload da imagem terminar.")
      return
    }

    setLoading(true)

    try {
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
            description,
            category,
            price,
            image,
            featured,
          }),
        }
      )

      if (response.status === 401) {
        router.push("/admin-login")
        return
      }

      if (!response.ok) {
        throw new Error("Erro ao salvar produto.")
      }

      const wasEditing = Boolean(editingProductId)
      resetForm()
      await loadProducts()

      toast.success(
        wasEditing
          ? "Produto atualizado com sucesso."
          : "Produto cadastrado com sucesso."
      )
    } catch {
      toast.error("Não foi possível salvar o produto.")
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(product: Product) {
    setEditingProductId(product.id)
    setTitle(product.title)
    setDescription(product.description ?? "")
    setCategory(product.category)
    setPrice(String(product.price))
    setImage(product.image)
    setLocalPreview(null)
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

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (response.status === 401) {
        router.push("/admin-login")
        return
      }

      if (!response.ok) {
        throw new Error("Erro ao excluir produto.")
      }

      await loadProducts()
      toast.success("Produto excluído com sucesso.")
    } catch {
      toast.error("Não foi possível excluir o produto.")
    }
  }

  const searchText = normalizeSearchText(adminSearch)

  const filteredProducts = products.filter((product) => {
    const productText = normalizeSearchText(`
      ${product.title}
      ${product.description ?? ""}
      ${product.category}
      ${product.price}
    `)

    return productText.includes(searchText)
  })

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
        <p className="text-[#5C5C5C]">Verificando acesso...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
              CS Store
            </span>
            <h1 className="mt-2 text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
              Painel administrativo
            </h1>
          </div>

          <button
            onClick={async () => {
              await fetch("/api/admin/logout", {
                method: "POST",
              })

              toast.success("Sessão encerrada.")
              router.push("/admin-login")
            }}
            className="w-full rounded-full border border-[#E7E1D8] bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-red-300 hover:text-red-500 sm:w-auto"
          >
            Sair
          </button>
        </div>

        <section className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-7">
          <div className="mb-7">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
              Produtos
            </span>

            <h2 className="mt-3 text-3xl font-semibold text-[#1A1A1A]">
              {editingProductId ? "Editar produto" : "Cadastrar produto"}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[#5C5C5C] md:text-base">
              Gerencie produtos, descrições, imagens e destaque do catálogo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nome do produto
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  className={inputClass}
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
                  className={inputClass}
                >
                  <option value="Cabelos">Cabelos</option>
                  <option value="Cosméticos">Cosméticos</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Descrição do produto
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={`${inputClass} min-h-28 resize-y leading-relaxed`}
                  placeholder="Descreva benefícios, textura, acabamento ou indicação de uso."
                />
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
                  min="0"
                  className={inputClass}
                  placeholder="Ex: 129.90"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Imagem do produto
                </label>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E7E1D8] bg-[#F8F6F2] px-4 py-3 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]">
                  <Upload size={18} />
                  {uploadingImage ? "Enviando imagem..." : "Selecionar imagem"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingImage}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ""

                      if (file) {
                        void handleImageUpload(file)
                      }
                    }}
                  />
                </label>

                {image && !uploadingImage && (
                  <p className="mt-2 text-xs text-[#6F6A63]">
                    Imagem pronta para salvar.
                  </p>
                )}
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-[#E7E1D8] p-4 md:col-span-2">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) => setFeatured(event.target.checked)}
                />

                <span>Marcar como produto em destaque</span>
              </label>

              <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
                <button
                  disabled={loading || uploadingImage}
                  className="rounded-full bg-[#B89535] px-6 py-3 font-semibold text-black transition hover:bg-[#A7832E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Salvando..."
                    : editingProductId
                      ? "Atualizar produto"
                      : "Salvar produto"}
                </button>

                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-[#E7E1D8] px-6 py-3 font-semibold text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]"
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-[#D8CBB9] bg-[#F8F6F2] p-4">
              <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">
                Preview da imagem
              </p>

              {imagePreviewSrc ? (
                <div
                  className="aspect-square w-full rounded-xl bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${imagePreviewSrc}")`,
                  }}
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-xl bg-white px-4 text-center text-sm text-[#6F6A63]">
                  Selecione uma imagem para enviar ao Cloudinary.
                </div>
              )}

              <p className="mt-3 text-xs leading-relaxed text-[#6F6A63]">
                Produtos antigos com imagens locais continuam funcionando. Para
                novos produtos, selecione uma imagem e salve após o upload.
              </p>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-7">
          <div className="mb-6">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
              Catálogo
            </span>

            <h2 className="mt-3 text-3xl font-semibold text-[#1A1A1A]">
              Produtos cadastrados
            </h2>

            <input
              value={adminSearch}
              onChange={(event) => setAdminSearch(event.target.value)}
              placeholder="Pesquisar por nome, descrição, categoria ou preço..."
              className={`${inputClass} mt-6`}
            />
          </div>

          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 rounded-2xl border border-[#E7E1D8] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 gap-4">
                  <Image
                    src={normalizeProductImageSrc(product.image)}
                    alt={product.title}
                    width={76}
                    height={76}
                    className="h-[76px] w-[76px] shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-semibold text-[#1A1A1A]">
                      {product.title}
                    </h3>

                    <p className="mt-1 text-sm text-[#5C5C5C]">
                      {product.category} •{" "}
                      {product.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>

                    {product.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-[#6F6A63]">
                        {product.description}
                      </p>
                    )}

                    {product.featured && (
                      <span className="mt-2 inline-block rounded-full bg-[#B89535]/15 px-3 py-1 text-xs font-semibold text-[#8A6800]">
                        Destaque
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:flex md:shrink-0">
                  <button
                    onClick={() => handleEdit(product)}
                    className="rounded-full border border-[#E7E1D8] px-4 py-2 text-sm transition hover:border-[#B89535] hover:text-[#B89535]"
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
              <div className="rounded-2xl border border-dashed border-[#D8CBB9] bg-[#F8F6F2] p-6 text-center text-[#5C5C5C]">
                Nenhum produto encontrado.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
