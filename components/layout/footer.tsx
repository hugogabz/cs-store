import {
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react"

export function Footer() {
  return (
    <footer
      id="footer"
      className="border-t border-[#E7E1D8] bg-white pb-24 pt-16 md:pb-0"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-4 md:px-8">
        <div>
          <h2 className="logo-font mb-4 text-3xl font-bold text-[#B28A22]">
            CS Store
          </h2>

          <p className="leading-relaxed text-[#5C5C5C]">
            Beleza premium, cosméticos, acessórios e produtos para cabelo
            cuidadosamente selecionados.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-[#1A1A1A]">
            Navegação
          </h3>

          <div className="space-y-3 text-sm text-[#5C5C5C]">
            <a href="#inicio" className="block hover:text-[#B28A22]">
              Início
            </a>

            <a href="#cabelos" className="block hover:text-[#B28A22]">
              Cabelos
            </a>

            <a href="#cosmeticos" className="block hover:text-[#B28A22]">
              Cosméticos
            </a>

            <a href="#acessorios" className="block hover:text-[#B28A22]">
              Acessórios
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-[#1A1A1A]">
            Contato
          </h3>

          <div className="space-y-4 text-sm text-[#5C5C5C]">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              (00) 00000-0000
            </div>

            <div className="flex items-center gap-2">
              <Mail size={16} />
              contato@csstore.com.br
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} />
              Brasil
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-[#1A1A1A]">
            Redes sociais
          </h3>

          <div className="flex gap-4">
            <button
              className="rounded-full border border-[#E7E1D8] p-3 transition hover:border-[#D4AF37] hover:text-[#B28A22]"
              aria-label="Abrir contato por mensagem"
            >
              <Send size={18} />
            </button>

            <button
              className="rounded-full border border-[#E7E1D8] p-3 transition hover:border-[#D4AF37] hover:text-[#B28A22]"
              aria-label="Abrir e-mail de contato"
            >
              <Mail size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-[#E7E1D8] py-6 text-center text-sm text-[#8A8A8A]">
        © 2026 CS Store. Todos os direitos reservados.
      </div>
    </footer>
  )
}
