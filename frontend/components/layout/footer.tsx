import { Camera, Mail, MapPin } from "lucide-react"
import { storeCategories } from "@/shared/utils/categories"

const customerEmail = "souzacristiane931@gmail.com"
const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${customerEmail}`
const instagramUrl = "https://www.instagram.com/cs.trancinhas"

export function Footer() {
  return (
    <footer
      id="footer"
      className="scroll-mt-24 border-t border-[#E7E1D8] bg-white pb-32 pt-12 md:pb-0 md:pt-16"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 md:grid-cols-4 md:gap-12 md:px-8">
        <div>
          <h2 className="logo-font mb-4 text-3xl font-bold text-[#B89535]">
            CS Store
          </h2>

          <p className="leading-relaxed text-[#5C5C5C]">
            Beleza premium, cosmeticos, acessorios e produtos para cabelo
            cuidadosamente selecionados.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-[#1A1A1A]">
            Navegacao
          </h3>

          <div className="space-y-3 text-sm text-[#5C5C5C]">
            <a href="#inicio" className="block transition hover:text-[#B89535]">
              Inicio
            </a>

            {storeCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="block transition hover:text-[#B89535]"
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-[#1A1A1A]">
            Contato
          </h3>

          <div className="space-y-4 text-sm text-[#5C5C5C]">
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 rounded-xl py-1 transition hover:text-[#B89535]"
            >
              <Mail size={17} className="mt-0.5 shrink-0 text-[#B89535]" />
              <span className="break-all">{customerEmail}</span>
            </a>

            <div className="flex items-center gap-3 py-1">
              <MapPin size={17} className="shrink-0 text-[#B89535]" />
              Almenara, Minas Gerais
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-[#1A1A1A]">
            Redes sociais
          </h3>

          <div className="flex flex-col gap-3 text-sm text-[#5C5C5C]">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-3 rounded-full border border-[#E7E1D8] px-4 py-3 font-semibold transition hover:border-[#B89535] hover:text-[#B89535]"
              aria-label="Abrir Instagram da CS Store em nova aba"
            >
              <Camera size={18} />
              Instagram
            </a>

            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-3 rounded-full border border-[#E7E1D8] px-4 py-3 font-semibold transition hover:border-[#B89535] hover:text-[#B89535]"
              aria-label="Abrir Gmail para enviar e-mail de contato"
            >
              <Mail size={18} />
              Email
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-[#E7E1D8] px-4 py-6 text-center text-sm text-[#8A8A8A] md:mt-12">
        © 2026 CS Store. Todos os direitos reservados.
      </div>
    </footer>
  )
}
