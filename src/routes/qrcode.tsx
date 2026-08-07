import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QrCode, ScanLine, Zap } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { empresas } from "@/data/vanpro";

export const Route = createFileRoute("/qrcode")({
  head: () => ({
    meta: [
      { title: "Encontrar empresa por QR Code — VanPro" },
      {
        name: "description",
        content: "Escaneie o QR Code da empresa e veja frota, rotas, horários e contatos na hora.",
      },
      { property: "og:title", content: "QR Code — VanPro" },
      {
        property: "og:description",
        content: "Leia o código da empresa e abra o perfil completo instantaneamente.",
      },
    ],
  }),
  component: Scanner,
});

function Scanner() {
  const navigate = useNavigate();
  const [lendo, setLendo] = useState(false);

  useEffect(() => {
    if (!lendo) return;
    const t = setTimeout(() => {
      navigate({ to: "/empresa/$id", params: { id: empresas[0]!.id } });
    }, 1800);
    return () => clearTimeout(t);
  }, [lendo, navigate]);

  return (
    <AppScreen title="Encontrar por QR Code" subtitle="Aponte para o código da empresa">
      <div className="relative mx-auto mt-2 aspect-square w-full max-w-[19rem] overflow-hidden rounded-3xl bg-[oklch(0.12_0.03_265)] shadow-[var(--shadow-card)]">
        <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-border/60" />
        {[
          "top-5 left-5 border-t-3 border-l-3 rounded-tl-xl",
          "top-5 right-5 border-t-3 border-r-3 rounded-tr-xl",
          "bottom-5 left-5 border-b-3 border-l-3 rounded-bl-xl",
          "bottom-5 right-5 border-b-3 border-r-3 rounded-br-xl",
        ].map((c) => (
          <span key={c} className={`absolute size-12 border-primary ${c}`} />
        ))}
        <QrCode className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/25" />
        {lendo && (
          <span className="absolute inset-x-8 top-8 h-0.5 animate-[rise-in_1.4s_ease-in-out_infinite_alternate] bg-primary shadow-[0_0_20px_var(--primary)]" />
        )}
      </div>

      <button
        onClick={() => setLendo(true)}
        className="press mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-base font-bold text-primary-foreground shadow-[var(--shadow-brand)]"
      >
        <ScanLine className="size-5" />
        {lendo ? "Lendo código…" : "Escanear QR Code"}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Zap className="size-3.5 text-primary" /> A empresa abre automaticamente após a leitura
      </p>

      <h2 className="mt-8 mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Lidas recentemente
      </h2>
      <div className="space-y-2.5">
        {empresas.slice(0, 2).map((e) => (
          <button
            key={e.id}
            onClick={() => navigate({ to: "/empresa/$id", params: { id: e.id } })}
            className="press card-elevated flex w-full items-center gap-3 p-3.5 text-left"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand text-sm font-bold text-primary-foreground">
              {e.sigla}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">{e.nome}</span>
              <span className="text-[11px] text-muted-foreground">{e.cidade}</span>
            </span>
          </button>
        ))}
      </div>
    </AppScreen>
  );
}
