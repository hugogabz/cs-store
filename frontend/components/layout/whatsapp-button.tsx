"use client"

import { MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation"

const whatsappNumber = "5500000000000"
const whatsappMessage =
  "Olá! Vim pelo site da CS Store e gostaria de mais informações."

export function WhatsAppButton() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin") || pathname === "/admin-login") {
    return null
  }

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com a CS Store no WhatsApp"
      className="fixed bottom-24 right-4 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_38px_rgba(37,211,102,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(37,211,102,0.42)] md:bottom-6 md:right-6"
    >
      <MessageCircle size={27} strokeWidth={2.4} />
    </a>
  )
}
