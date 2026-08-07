import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { AppScreen } from "@/components/AppScreen";
import { usePainel } from "@/data/painel";

export const Route = createFileRoute("/painel/qrcode")({
  head: () => ({
    meta: [
      { title: "QR Code da empresa — Painel VanPro" },
      {
        name: "description",
        content: "Gere o QR Code exclusivo da sua empresa para que os clientes acessem suas viagens.",
      },
      { property: "og:title", content: "QR Code da empresa — Painel VanPro" },
      { property: "og:description", content: "Código de acesso direto ao perfil da sua transportadora." },
    ],
  }),
  component: PainelQr,
});

function PainelQr() {
  const { config } = usePainel();
  const [copiado, setCopiado] = useState(false);
  const codigo = `VANPRO-${config.empresa.sigla.toUpperCase()}-${config.empresa.cnpj.replace(/\D/g, "").slice(0, 6)}`;

  return (
    <AppScreen title="QR Code da empresa" subtitle="Compartilhe com seus clientes" back="/painel">
      <div className="card-elevated flex flex-col items-center p-6">
        <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
          <QRCodeSVG value={codigo} size={188} level="M" bgColor="transparent" fgColor="#1b1f3b" />
        </div>
        <p className="mt-5 text-sm font-bold">{config.empresa.nome}</p>
        <p className="text-[11px] text-muted-foreground">{config.empresa.cidade}</p>
        <p className="mt-4 rounded-xl bg-surface-2 px-4 py-2 text-xs font-bold tracking-wide">
          {codigo}
        </p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(codigo);
            setCopiado(true);
          }}
          className="press bg-brand mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-brand)]"
        >
          {copiado ? <Check className="size-4.5" /> : <Copy className="size-4.5" />}
          {copiado ? "Código copiado" : "Copiar código"}
        </button>
      </div>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted-foreground">
        O cliente lê este código na tela “QR Code” do aplicativo e entra direto no perfil da sua
        empresa, com frota, rotas, horários e agendamento.
      </p>
    </AppScreen>
  );
}
