import Link from "next/link"

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-[#E7E1D8] bg-white p-8 text-center shadow-[0_12px_34px_rgba(26,26,26,0.04)]">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
          CS Store
        </span>

        <h1 className="mt-4 text-3xl font-semibold text-[#1A1A1A]">
          Pagamento recebido.
        </h1>

        <p className="mt-3 text-[#6F6A63]">
          Estamos verificando sua compra. Assim que o pagamento for confirmado,
          o status do pedido será atualizado.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex rounded-full bg-[#B89535] px-6 py-3 font-semibold text-black transition hover:bg-[#A7832E]"
        >
          Voltar para loja
        </Link>
      </section>
    </main>
  )
}
