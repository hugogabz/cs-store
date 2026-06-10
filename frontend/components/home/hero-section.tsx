"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

const banners = [
  "/banners/banner1.webp",
  "/banners/banner2.webp",
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
      className="relative flex min-h-[560px] items-center overflow-hidden bg-[#F8F6F2] px-4 py-14 md:min-h-[760px] md:px-8 md:py-0"
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/12 to-white/12 md:bg-gradient-to-r md:from-[#F8F6F2]/86 md:via-[#F8F6F2]/52 md:to-transparent" />
      <div className="absolute inset-0 bg-[#1A1A1A]/10 md:bg-white/5" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto w-full max-w-7xl md:flex md:items-center"
      >
        <div className="max-w-2xl text-center md:text-left">
          <span className="mb-5 inline-block rounded-full border border-[#B89535]/35 bg-white/82 px-4 py-2 text-xs font-medium text-[#8A6800] shadow-[0_10px_30px_rgba(26,26,26,0.08)] backdrop-blur md:mb-6 md:px-5 md:text-sm">
            Beauty Luxury Experience
          </span>

          <h1 className="mb-5 text-3xl font-bold leading-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.28)] md:mb-6 md:text-6xl md:text-[#1A1A1A] md:drop-shadow-none">
            Beleza premium com elegância moderna
          </h1>

          <p className="mx-auto mb-7 max-w-xl text-sm leading-relaxed text-white/92 drop-shadow-[0_3px_18px_rgba(0,0,0,0.24)] md:mx-0 md:mb-10 md:text-lg md:text-[#3F3F3F] md:drop-shadow-none">
            Descubra produtos exclusivos para cabelo, cosméticos e acessórios em
            uma experiência sofisticada e refinada.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <a
              href="#destaques"
              className="rounded-full bg-[#B89535] px-6 py-3 text-sm font-semibold text-black shadow-[0_14px_36px_rgba(0,0,0,0.18)] transition hover:bg-[#A7832E] md:px-8 md:py-4 md:text-base"
            >
              Explorar produtos
            </a>

            <a
              href="#cabelos"
              className="rounded-full border border-white/70 bg-white/78 px-6 py-3 text-sm font-semibold text-[#1A1A1A] backdrop-blur transition hover:border-[#B89535] hover:text-[#8A6800] md:border-[#B89535]/50 md:px-8 md:py-4 md:text-base"
            >
              Ver coleções
            </a>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-8">
        {banners.map((banner, index) => (
          <button
            key={banner}
            type="button"
            onClick={() => setCurrentBanner(index)}
            className={`h-1.5 rounded-full transition ${
              currentBanner === index ? "w-8 bg-[#B89535]" : "w-2.5 bg-white/70"
            }`}
            aria-label={`Ver banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
