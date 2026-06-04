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
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#F8F6F2] px-4 py-16 md:min-h-[88vh] md:px-8 md:py-0"
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentBanner}
          src={banners[currentBanner]}
          alt="Banner CS Store"
          initial={{ opacity: 0, scale: 1.015 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[#F8F6F2]/80 via-[#F8F6F2]/45 to-[#F8F6F2]/10" />
      <div className="absolute inset-0 bg-white/10" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-3xl text-center md:text-left"
      >
        <span className="mb-5 inline-block rounded-full border border-[#B89535]/30 bg-white/75 px-4 py-2 text-xs font-medium text-[#8A6800] backdrop-blur md:mb-6 md:px-5 md:text-sm">
          Beauty Luxury Experience
        </span>

        <h1 className="mb-5 text-3xl font-bold leading-tight text-[#1A1A1A] md:mb-6 md:text-6xl">
          Beleza premium com elegância moderna
        </h1>

        <p className="mb-7 text-sm leading-relaxed text-[#3F3F3F] md:mb-10 md:text-lg">
          Descubra produtos exclusivos para cabelo, cosméticos e acessórios em
          uma experiência sofisticada e refinada.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
          <a
            href="#destaques"
            className="rounded-full bg-[#B89535] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#A7832E] md:px-8 md:py-4 md:text-base"
          >
            Explorar produtos
          </a>

          <a
            href="#cabelos"
            className="rounded-full border border-[#B89535]/50 bg-white/70 px-6 py-3 text-sm font-semibold text-[#1A1A1A] backdrop-blur transition hover:border-[#B89535] hover:text-[#8A6800] md:px-8 md:py-4 md:text-base"
          >
            Ver coleções
          </a>
        </div>
      </motion.div>
    </section>
  )
}
