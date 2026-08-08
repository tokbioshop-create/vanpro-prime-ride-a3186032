import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import homeHero from "@/assets/home-hero.jpg.asset.json";
import { BottomNav } from "@/components/BottomNav";
import { FeedbackEmpresa } from "@/components/FeedbackEmpresa";
import { MenuDrawer } from "@/components/MenuDrawer";
import { DepoimentosCarrossel } from "@/components/DepoimentosCarrossel";
import { usePainel, useAvaliacoes } from "@/data/painel";
import { empresas } from "@/data/vanpro";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Início — VanPro" },
      {
        name: "description",
        content:
          "Agende viagens, acompanhe reservas, pague e fale com o motorista direto no VanPro.",
      },
      { property: "og:title", content: "Início — VanPro" },
      {
        property: "og:description",
        content: "Todos os atalhos do seu transporte executivo em um só lugar.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [menu, setMenu] = useState(false);
  const { config } = usePainel();
  const { lista } = useAvaliacoes();

  const rota = config.agendamento.rotas[0] ?? "Salvador → Praia do Forte";
  const [origem, destino] = rota.split(/→|->/).map((s) => s.trim());

  const base = empresas[0]!.nota;
  const nota = lista.length
    ? lista.reduce((s, a) => s + a.estrelas, 0) / lista.length
    : base;
  const total = lista.length || 128;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="relative mx-auto w-full max-w-md overflow-hidden rounded-b-3xl">
        <img
          src={homeHero.url}
          alt="Van executiva VanPro em rodovia iluminada"
          width={720}
          height={775}
          className="block w-full select-none"
        />

        {/* painel de dados dinâmicos sobre a área escura do protótipo */}
        <div className="absolute inset-x-0 top-[15%] bottom-[42%] flex flex-col justify-center bg-[linear-gradient(90deg,oklch(0.12_0.06_268)_0%,oklch(0.12_0.06_268/0.96)_46%,oklch(0.12_0.06_268/0)_78%)] px-5">
          <h1 className="max-w-[62%] text-[26px] leading-[1.05] font-extrabold text-[oklch(0.99_0_0)]">
            {config.empresa.nome}
          </h1>
          <p className="mt-2.5 w-fit rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[oklch(0.92_0.02_265)] ring-1 ring-[oklch(1_0_0/0.35)]">
            CNPJ. {config.empresa.cnpj}
          </p>
          <span className="bg-gold mt-3 block h-1 w-9 rounded-full" />
          <p className="mt-2 text-lg leading-tight font-extrabold tracking-tight text-[oklch(0.99_0_0)] uppercase">
            {origem}
            <br />
            {destino ?? config.empresa.cidade}
          </p>
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setMenu(true)}
          className="press absolute top-[1%] left-[2%] size-[13%] rounded-full"
        />
        <Link
          to="/ajuda"
          aria-label="Notificações"
          className="press absolute top-[1%] right-[2%] size-[13%] rounded-full"
        />
      </header>

      <div className="mx-auto max-w-md px-4">
        <section className="card-elevated mt-4 flex items-center justify-between p-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Avaliação da empresa</p>
            <p className="text-2xl font-extrabold text-primary">{nota.toFixed(1)}</p>
            <p className="text-[11px] text-muted-foreground">{total} avaliações</p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={
                  "size-5 " +
                  (n <= Math.round(nota)
                    ? "fill-[var(--gold)] text-[var(--gold)]"
                    : "text-muted-foreground/40")
                }
              />
            ))}
          </div>
        </section>

        <DepoimentosCarrossel />

        <FeedbackEmpresa />
      </div>

      <MenuDrawer open={menu} onClose={() => setMenu(false)} empresa={config.empresa} />
      <BottomNav />
    </div>
  );
}
