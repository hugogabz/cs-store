"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

const banners = [
  "/banners/banner1.svg",
  "/banners/banner2.svg",
]

export function HeroSection() {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section
      id="inicio"
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-[#F8F6F2] px-4 md:px-8"
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentBanner}
          src={banners[currentBanner]}
          alt="Banner CS Store"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[#F8F6F2]/55 via-[#F8F6F2]/20 to-transparent" />
      <div className="absolute inset-0 bg-black/10" />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-3xl text-center md:text-left"
      >
        <span className="mb-6 inline-block rounded-full border border-[#D4AF37]/30 bg-white/60 px-5 py-2 text-sm font-medium text-[#A67C00] backdrop-blur">
          Beauty Luxury Experience
        </span>

        <h1 className="mb-6 text-4xl font-bold leading-tight text-[#1A1A1A] md:text-6xl">
          Beleza premium com elegância moderna
        </h1>

        <p className="mb-10 text-base leading-relaxed text-[#3F3F3F] md:text-lg">
          Descubra produtos exclusivos para cabelo, cosméticos
          e acessórios em uma experiência sofisticada e refinada.
        </p>

        <div className="flex flex-col gap-4 md:flex-row">
          <a
            href="#destaques"
            className="rounded-full bg-[#D4AF37] px-8 py-4 font-semibold text-black transition hover:scale-105"
          >
            Explorar Produtos
          </a>

          <a
            href="#cabelos"
            className="rounded-full border border-[#D4AF37]/50 bg-white/50 px-8 py-4 font-semibold text-[#1A1A1A] backdrop-blur transition hover:border-[#D4AF37] hover:text-[#A67C00]"
          >
            Ver Coleções
          </a>
        </div>
      </motion.div>
    </section>
  )
}