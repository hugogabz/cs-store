"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

const links = [
  {
    href: "/admin",
    label: "Produtos",
  },
  {
    href: "/admin/orders",
    label: "Pedidos",
  },
  {
    href: "/admin/reservations",
    label: "Reservas",
  },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    })

    toast.success("Sessao encerrada.")
    router.push("/admin-login")
  }

  return (
    <nav className="flex flex-col gap-3 rounded-2xl border border-[#E7E1D8] bg-white p-3 shadow-[0_12px_34px_rgba(26,26,26,0.04)] sm:flex-row sm:items-center sm:justify-between">
      <div className="grid grid-cols-3 gap-2 sm:flex">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-center text-sm font-semibold transition ${
                isActive
                  ? "bg-[#B89535] text-black"
                  : "border border-[#E7E1D8] text-[#1A1A1A] hover:border-[#B89535] hover:text-[#B89535]"
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
      >
        Sair
      </button>
    </nav>
  )
}
