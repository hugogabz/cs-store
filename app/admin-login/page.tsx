"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    })

    setLoading(false)

    if (response.ok) {
      router.push("/admin")
      return
    }

    setError("Senha incorreta.")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B28A22]">
          CS Store
        </span>

        <h1 className="mt-4 text-4xl font-bold text-[#1A1A1A]">
          Login Admin
        </h1>

        <p className="mt-3 text-[#5C5C5C]">
          Acesse o painel administrativo da loja.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-[#E7E1D8] px-4 py-3 outline-none focus:border-[#D4AF37]"
              placeholder="Digite a senha"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-full bg-[#D4AF37] py-4 font-semibold text-black transition hover:bg-[#C89B2C] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  )
}
